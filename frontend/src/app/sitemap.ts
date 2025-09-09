import {client} from '@/lib/sanity'

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL!
  const slugs: string[] = await client.fetch(
    '*[_type=="post" && (!defined(isPrivate) || isPrivate==false)].slug.current',
    {}, { next:{ tags:['blog'] } }
  )
  const pages = slugs.map(s=>({ url: `${base}/blog/${s}`, changeFrequency: 'weekly', priority: 0.7 }))
  return [{ url: `${base}/blog`, changeFrequency:'daily', priority:0.8 }, ...pages]
}