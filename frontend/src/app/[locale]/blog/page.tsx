import {client} from '@/lib/sanity'
import {listPosts} from '@/lib/queries'
import Link from 'next/link'
import Image from 'next/image'
import {urlFor} from '@/lib/image'

export const revalidate = 300
export const dynamic = 'force-static'

export default async function BlogIndex() {
  const posts = await client.fetch(listPosts, {}, { next:{ tags:['blog'] } })
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <ul className="space-y-8">
        {posts.map((p:any) => (
          <li key={p._id} className="border rounded-2xl p-4">
            {p.coverImage && (
              <Image
                src={urlFor(p.coverImage).width(1200).height(630).url()}
                alt={p.title} width={1200} height={630} className="rounded-xl w-full h-auto"
                priority
              />
            )}
            <h2 className="text-xl font-semibold mt-3">
              <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            {p.excerpt && <p className="text-sm opacity-80 mt-2">{p.excerpt}</p>}
          </li>
        ))}
      </ul>
    </main>
  )
}
