"use client";

import Footer from '@/components/ui/footer';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { NewsletterBanner } from '@/components/ui/newsletter-banner';
import { useTranslations } from 'next-intl';
import { BlogCard } from './blog-card';
import { CategoryChips } from './category-chips';
import { FeaturedPosts } from './featured-posts';
import { PaginationControls } from '@/components/ui/pagination-controls';
import type { BlogPost, Category } from './types';
import { isExcludedCategory } from "./category-utils";
import { Search } from 'lucide-react';
import Banner from '@/components/ui/banner';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';

const WhatsAppBubble = dynamic(() => import('@/components/home/whatsapp-bubble'), {
  ssr: false,
  loading: () => null,
});
import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  posts: BlogPost[];
  total: number;
  pageSize?: number;
  highlightedPosts?: BlogPost[];
  basePath?: string;
  translationsNamespace?: "blog" | "news";
};

const mapCategories = (items: BlogPost[]) => {
  const categories: Record<string, string> = {};
  items.forEach(p => {
    if (Array.isArray(p.categories)) {
      p.categories.forEach((cat: Category) => {
        if (isExcludedCategory(cat)) return;
        const key = cat?.slug || cat?.title;
        const label = cat?.title || cat?.slug;
        if (key && label) categories[key] = label;
      });
    }
  });
  return categories;
};

export default function BlogClient({
  posts: initialPosts,
  total: initialTotal,
  pageSize = 6,
  highlightedPosts = [],
  basePath = "/blog",
  translationsNamespace = "blog",
}: Props) {
  const t = useTranslations(translationsNamespace);
  const normalizedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>(() => mapCategories(initialPosts));
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const mergeCategories = useCallback((items: BlogPost[]) => {
    setCategoryMap(prev => ({ ...prev, ...mapCategories(items) }));
  }, []);

  // Mutable refs so effects can read the latest state without re-running on every change
  const currentPageRef = useRef(currentPage);
  const selectedCategoryRef = useRef(selectedCategory);
  const debouncedSearchRef = useRef(debouncedSearch);
  const orderRef = useRef(order);
  const latestInitialPostsRef = useRef(initialPosts);
  const latestInitialTotalRef = useRef(initialTotal);

  // Keep refs current after every render. Declared before the other effects, so it runs first.
  useEffect(() => {
    currentPageRef.current = currentPage;
    selectedCategoryRef.current = selectedCategory;
    debouncedSearchRef.current = debouncedSearch;
    orderRef.current = order;
    latestInitialPostsRef.current = initialPosts;
    latestInitialTotalRef.current = initialTotal;
  });

  // Sync from server data only when we are genuinely in the base state.
  // Without this guard, every router.push triggers a server re-render (force-dynamic)
  // which passes new initialPosts (always page 1) and wipes out the paginated data.
  useEffect(() => {
    const isBase =
      currentPageRef.current === 1 &&
      selectedCategoryRef.current === 'all' &&
      debouncedSearchRef.current === '' &&
      orderRef.current === 'desc';
    if (isBase) {
      setPosts(initialPosts);
      setTotal(initialTotal);
    }
    mergeCategories(initialPosts);
  }, [initialPosts, initialTotal, mergeCategories]);

  // Sync selectedCategory and page with URL params
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlPage = Number(searchParams.get('page') || '1');
    const urlOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const nextCategory = urlCategory ?? 'all';
    const nextPage = Number.isFinite(urlPage) && urlPage > 0 ? Math.floor(urlPage) : 1;

    setSelectedCategory(prev => (prev === nextCategory ? prev : nextCategory));
    setCurrentPage(prev => (prev === nextPage ? prev : nextPage));
    setOrder(prev => (prev === urlOrder ? prev : urlOrder));
  }, [searchParams]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const updateRouteParams = useCallback((categoryValue: string, pageValue: number, orderValue: 'asc' | 'desc') => {
    const params = new URLSearchParams();
    if (categoryValue !== 'all') params.set('category', categoryValue);
    if (pageValue > 1) params.set('page', String(pageValue));
    if (orderValue === 'asc') params.set('order', 'asc');
    const query = params.toString();
    router.push(`${normalizedBasePath}${query ? `?${query}` : ''}`);
  }, [router, normalizedBasePath]);

  useEffect(() => {
    const baseState = debouncedSearch === '' && selectedCategory === 'all' && currentPage === 1 && order === 'desc';
    if (baseState) {
      // Read from refs so we always use the latest server-provided data
      // without including initialPosts/initialTotal in the effect's deps
      // (they would cause redundant fetches on every server re-render).
      setPosts(latestInitialPostsRef.current);
      setTotal(latestInitialTotalRef.current);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('pageSize', String(pageSize));
    params.set('order', order);
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);

    fetch(`${normalizedBasePath}/search?${params.toString()}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setPosts(data.items ?? []);
        setTotal(data.total ?? 0);
        mergeCategories(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(t('errors.loadPosts', { default: 'No se pudieron cargar las publicaciones.' }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedCategory, currentPage, pageSize, mergeCategories, t, order, normalizedBasePath]);

  const categories = useMemo(() => {
    const options = Object.entries(categoryMap).map(([value, label]) => ({ value, label }));
    options.sort((a, b) => a.label.localeCompare(b.label));
    return [
      { value: 'all', label: t('filters.all', { default: 'All Categories' }) },
      ...options
    ];
  }, [categoryMap, t]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    updateRouteParams(value, 1, order);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
      updateRouteParams(selectedCategory, 1, order);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
    updateRouteParams(selectedCategory, nextPage, order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderChange = (value: 'asc' | 'desc') => {
    setOrder(value);
    setCurrentPage(1);
    updateRouteParams(selectedCategory, 1, value);
  };

  const isBaseState =
    searchTerm === '' && debouncedSearch === '' && selectedCategory === 'all' && currentPage === 1 && order === 'desc';

  return (
    <div className="min-h-screen bg-ivory-light dark:bg-[var(--swatch--slate-dark)] text-gray-800 dark:text-white transition-colors duration-300">
      <Banner
        title={t('title', { default: 'Blog' })}
        subtitle={t('subtitle', { default: 'Discover our latest news, articles, and updates.' })}
        backgroundImage={'/static/backgrounds/blog_background.webp'}
      >
        <SearchFilterBar
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t('searchPlaceholder', { default: 'Search blog posts...' })}
          searchInputClassName="focus:border-clay dark:focus:border-clay"
          filters={[
            {
              options: [
                { value: 'desc', label: t('sort.newest', { default: 'Newest first' }) },
                { value: 'asc', label: t('sort.oldest', { default: 'Oldest first' }) },
              ],
              value: order,
              onChange: (value) => handleOrderChange(value as 'asc' | 'desc'),
              placeholder: t('sort.label', { default: 'Sort by date' }),
            },
          ]}
        />
      </Banner>

      {isBaseState && (
        <FeaturedPosts
          posts={highlightedPosts}
          onCategoryClick={handleCategoryChange}
          translationsNamespace={translationsNamespace}
        />
      )}

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-[-0.02em] text-slate-dark dark:text-ivory-light md:text-3xl">
            {t('otherPosts.title', { default: 'All posts' })}
          </h2>

          <CategoryChips
            options={categories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            label={t('filters.label', { default: 'Filter by category' })}
            className="mb-8"
          />

          {error && (
            <div role="alert" className="mb-8 text-center text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && posts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-ivory-medium dark:bg-white/5">
                <Search className="size-12 text-cloud-dark" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-dark dark:text-ivory-light">
                {t('noResults.title', { default: 'No blog posts found.' })}
              </h3>
              <p className="text-slate-light dark:text-cloud-medium">
                {t('noResults.description', { default: 'Check back soon for new articles and updates.' })}
              </p>
            </div>
          ) : (
            <ul
              aria-busy={loading}
              className={`grid grid-cols-1 gap-x-8 gap-y-12 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
                loading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {posts.map((p: BlogPost) => (
                <li key={p.slug}>
                  <BlogCard post={p} onCategoryClick={handleCategoryChange} />
                </li>
              ))}
            </ul>
          )}

          <PaginationControls
            totalItems={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            className="mt-12 justify-center sm:justify-center"
          />
        </div>
      </section>

      <div id="newsletter" className="scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
        <NewsletterBanner className="mx-auto w-full max-w-[1600px]" padded={false} />
      </div>

      <WhatsAppBubble />
      <Footer />
      <BackToTopButton />
    </div>
  );
}
