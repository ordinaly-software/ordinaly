import type { PortableTextBlock } from '@portabletext/types';

export interface BlogPost {
  ogImage: { asset?: { url: string; }; alt?: string } | undefined;
  mainImage: { asset?: { url: string; }; alt?: string } | undefined;
  title: string;
  seoDescription?: string;
  seoTitle?: string;
  excerpt?: string;
  coverImage?: {
    asset?: { url: string };
  };
  publishedAt?: string;
  _createdAt?: string;
  updatedAt?: string;
  _updatedAt?: string;
  author?: { name: string };
  slug: string;
  media?: MediaItem[];
  body: PortableTextBlock[];
  categories?: Category[];
}

export interface MediaItem {
  type: 'image' | 'video';
  asset?: { url: string };
  alt?: string;
  url?: string;
}

export interface Category {
  slug: string;
  title: string;
}
