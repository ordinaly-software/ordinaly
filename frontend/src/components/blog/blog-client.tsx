"use client";

import Footer from '@/components/ui/footer';
import BackToTopButton from '@/components/ui/back-to-top-button';
import { useTranslations } from 'next-intl';
import { BlogCard } from './blog-card';
import { Search } from 'lucide-react';
import Banner from '@/components/ui/banner';
import { Input } from '@/components/ui/input';
import { Dropdown } from '@/components/ui/dropdown';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BlogClient({ posts }: { posts: any[] }) {
  const t = useTranslations('blog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sync selectedCategory with ?category=... in URL
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    } else if (!urlCategory && selectedCategory !== 'all') {
      setSelectedCategory('all');
    }
  }, [searchParams, selectedCategory]);

  // Extract unique categories from posts (support array of categories)
  const categories = useMemo(() => {
    const cats: string[] = [];
    posts.forEach(p => {
      if (Array.isArray(p.categories)) {
        p.categories.forEach((cat: any) => {
          if (cat?.title) cats.push(cat.title);
        });
      } else if (p.category) {
        cats.push(p.category);
      }
    });
    return ['all', ...Array.from(new Set(cats))];
  }, [posts]);

  // Filter posts by search term and category
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchesSearch =
        !searchTerm ||
        (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      let postCategories: string[] = [];
      if (Array.isArray(p.categories)) {
        postCategories = p.categories.map((cat: any) => cat?.title).filter(Boolean);
      } else if (p.category) {
        postCategories = [p.category];
      }
      const matchesCategory =
        selectedCategory === 'all' || postCategories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      {/* Banner Section */}
      <Banner
        title={t('title', { default: 'Blog' })}
        subtitle={t('subtitle', { default: 'Discover our latest news, articles, and updates.' })}
        backgroundImage={'/static/backgrounds/blog_background.webp'}
      >
        <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder', { default: 'Search blog posts...' })}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-[#22A60D] dark:focus:border-[#22A60D]"
              />
            </div>
            {/* Category Dropdown */}
            <Dropdown
              options={categories.map(cat => ({ value: cat, label: cat === 'all' ? t('filters.all', { default: 'All Categories' }) : cat }))}
              value={selectedCategory}
              onChange={value => {
                setSelectedCategory(value);
                if (value === 'all') {
                  router.push('/blog');
                } else {
                  router.push(`/blog?category=${encodeURIComponent(value)}`);
                }
              }}
              minWidth="200px"
              placeholder={t('filters.category', { default: 'Category' })}
            />
          </div>
        </div>
      </Banner>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredPosts.length === 0 ? (
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
              {filteredPosts.map((p: any) => (
                <li key={p._id}>
                  <BlogCard
                    post={p}
                    onCategoryClick={(cat: string) => {
                      router.push(`/blog?category=${encodeURIComponent(cat)}`);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
