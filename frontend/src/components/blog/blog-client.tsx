"use client";

import Footer from '@/components/ui/footer';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { useTranslations, useLocale } from 'next-intl';
import { BlogCard } from './blog-card';
import { HighlightedCarousel } from './highlighted-carousel';
import type { BlogPost, Category } from './types';
import { Search } from 'lucide-react';
import Banner from '@/components/ui/banner';
import { Input } from '@/components/ui/input';
import { Dropdown } from '@/components/ui/dropdown';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type Props = {
  posts: BlogPost[];
  total: number;
  pageSize?: number;
  highlightedPosts?: BlogPost[];
};

const mapCategories = (items: BlogPost[]) => {
  const categories: Record<string, string> = {};
  items.forEach(p => {
    if (Array.isArray(p.categories)) {
      p.categories.forEach((cat: Category) => {
        const key = cat?.slug || cat?.title;
        const label = cat?.title || cat?.slug;
        if (key && label) categories[key] = label;
      });
    }
  });
  return categories;
};

export default function BlogClient({ posts: initialPosts, total: initialTotal, pageSize = 6, highlightedPosts = [] }: Props) {
  const t = useTranslations('blog');
  const locale = useLocale() || 'es';
  const localePrefix = locale ? `/${locale}` : '';
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

  // Keep local state in sync with server-provided defaults
  useEffect(() => {
    setPosts(initialPosts);
    setTotal(initialTotal);
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
    router.push(`${localePrefix}/blog${query ? `?${query}` : ''}`);
  }, [router, localePrefix]);

  useEffect(() => {
    const baseState = debouncedSearch === '' && selectedCategory === 'all' && currentPage === 1 && order === 'desc';
    if (baseState) {
      setPosts(initialPosts);
      setTotal(initialTotal);
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

    fetch(`${localePrefix}/blog/search?${params.toString()}`, { cache: 'no-store' })
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
  }, [debouncedSearch, selectedCategory, currentPage, pageSize, initialPosts, initialTotal, mergeCategories, t, localePrefix, order]);

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

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      {/* Banner Section */}
      <Banner
        title={t('title', { default: 'Blog' })}
        subtitle={t('subtitle', { default: 'Discover our latest news, articles, and updates.' })}
        backgroundImage={'/static/backgrounds/blog_background.webp'}
      >
        <div className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder', { default: 'Search blog posts...' })}
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#1F8A0D] dark:focus:border-[#3FBD6F]"
              />
            </div>
            {/* Category Dropdown */}
            <Dropdown
              options={categories}
              value={selectedCategory}
              onChange={handleCategoryChange}
              minWidth="200px"
              placeholder={t('filters.category', { default: 'Category' })}
            />
            {/* Order Dropdown */}
            <Dropdown
              options={[
                { value: 'desc', label: t('sort.newest', { default: 'Newest first' }) },
                { value: 'asc', label: t('sort.oldest', { default: 'Oldest first' }) },
              ]}
              value={order}
              onChange={value => handleOrderChange(value as 'asc' | 'desc')}
              minWidth="200px"
              placeholder={t('sort.label', { default: 'Sort by date' })}
            />
          </div>
        </div>
      </Banner>

      {/* Highlighted Posts Carousel */}
      <HighlightedCarousel 
        posts={highlightedPosts} 
        onCategoryClick={(cat: string) => handleCategoryChange(cat)}
      />

      {/* Blog Posts Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {t('otherPosts.title', { default: 'All posts' })}
          </h2>
          {error && (
            <div className="text-center mb-8 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1F8A0D] dark:hover:border-[#3FBD6F] hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('pagination.prev', { default: 'Previous' })}
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  {t('loading', { default: 'Loading posts...' })}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>{t('pagination.page', { default: 'Page' })}</span>
                  <strong className="text-gray-900 dark:text-white">{currentPage}</strong>
                  <span>{t('pagination.of', { default: 'of' })}</span>
                  <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
                </div>
              )}
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1F8A0D] dark:hover:border-[#3FBD6F] hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] transition"
                >
                  {t('pagination.next', { default: 'Next' })}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {!loading && posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('noResults.title', { default: 'No blog posts found.' })}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('noResults.description', { default: 'Check back soon for new articles and updates.' })}
              </p>
            </div>
          ) : (
            <ul className="space-y-12">
              {posts.map((p: BlogPost) => (
                <li key={p.slug}>
                  <BlogCard
                    post={p}
                    onCategoryClick={(cat: string) => handleCategoryChange(cat)}
                  />
                </li>
              ))}
            </ul>
          )}

          <br></br>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1F8A0D] dark:hover:border-[#3FBD6F] hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] transition"
              >
                <ChevronsLeft className="h-4 w-4" />
                {t('pagination.first', { default: 'First' })}
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1F8A0D] dark:hover:border-[#3FBD6F] hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] transition"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('pagination.prev', { default: 'Previous' })}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>{t('pagination.page')}</span>
                <strong className="text-gray-900 dark:text-white">{currentPage}</strong>
                <span>{t('pagination.of')}</span>
                <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1F8A0D] dark:hover:border-[#3FBD6F] hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] transition"
                >
                  {t('pagination.next')}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1F8A0D] dark:hover:border-[#3FBD6F] hover:text-[#1F8A0D] dark:hover:text-[#3FBD6F] transition"
                >
                  {t('pagination.last', { default: 'Last' })}
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
