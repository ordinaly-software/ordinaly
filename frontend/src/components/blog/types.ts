import type { PortableTextBlock } from '@portabletext/types';

export interface BlogPost {
  _id?: string;
  ogImage: { asset?: { url: string; }; alt?: string } | undefined;
  mainImage: { asset?: { url: string; }; alt?: string; caption?: string; attribution?: string } | undefined;
  title: string;
  seoDescription?: string;
  seoTitle?: string;
  excerpt?: string;
  postType?: 'post' | 'news';
  publishedAt?: string;
  _createdAt?: string;
  updatedAt?: string;
  _updatedAt?: string;
  author?: { name: string; image?: { asset?: { url: string }; alt?: string } };
  readingMinutes?: number;
  slug: string;
  body: PortableTextBlock[];
  categories?: Category[];
}

export interface Category {
  slug: string;
  title: string;
}
