import { client } from '@/lib/sanity';
import { listPosts } from '@/lib/queries';
import BlogClient from '@/components/blog/blog-client';

export const revalidate = 300;
export const dynamic = 'force-static';

export default async function BlogIndex() {
  const posts = await client.fetch(listPosts, {}, { next: { tags: ['blog'] } });
  const categories = Array.from(
    new Map(
      posts.flatMap((p: any) => p.categories || []).map((cat: any) => [cat.slug, cat])
    ).values()
  );
  return <BlogClient posts={posts} />;
}
