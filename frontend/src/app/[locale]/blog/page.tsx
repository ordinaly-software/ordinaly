import { client } from '@/lib/sanity';
import { listPosts } from '@/lib/queries';

export const revalidate = 300;
export const dynamic = 'force-static';

export default async function BlogIndex() {
  const posts = await client.fetch(listPosts, {}, { next: { tags: ['blog'] } });
  const { default: BlogClient } = await import('@/components/blog/blog-client');
  return <BlogClient posts={posts} />;
}
