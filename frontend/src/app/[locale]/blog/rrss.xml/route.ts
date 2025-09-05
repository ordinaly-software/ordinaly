import {NextResponse} from 'next/server'
import {client} from '@/lib/sanity'
import {listPosts} from '@/lib/queries'

export const revalidate = 600

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL!
  const posts = await client.fetch(listPosts, {}, {next:{tags:['blog']}})
  const items = posts.map((p:any)=>`
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${base}/blog/${p.slug}</link>
      <guid>${base}/blog/${p.slug}</guid>
      <description><![CDATA[${p.excerpt ?? ''}]]></description>
      <pubDate>${new Date(p.publishedAt ?? p._createdAt).toUTCString()}</pubDate>
    </item>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0"><channel>
  <title>Ordinaly Blog</title>
  <link>${base}/blog</link>
  <description>Updates & Articles</description>
  ${items}
  </channel></rss>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/rss+xml' } })
}
