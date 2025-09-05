import {client} from '@/lib/sanity'
import {postBySlug} from '@/lib/queries'
import {Metadata} from 'next'
import Image from 'next/image'
import {urlFor} from '@/lib/image'
import {PortableText} from '@portabletext/react'

type Props = { params: { slug: string } }

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(
    '*[_type=="post" && (!defined(isPrivate) || isPrivate==false)].slug.current'
  )
  return slugs.map(slug => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const p = await client.fetch(postBySlug, {slug: params.slug})
  if (!p) return {}
  const title = p?.seo?.metaTitle ?? p.title
  const desc = p?.seo?.metaDescription ?? p.excerpt ?? ''
  const og = p?.seo?.ogImage ?? p?.coverImage
  const images = og ? [{ url: urlFor(og).width(1200).height(630).url() }] : []
  const canonical = p?.seo?.canonical ?? `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${p.slug}`
  return {
    title, description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, images, type: 'article', url: canonical },
    twitter: { card: 'summary_large_image', title, description: desc, images: images.map(i=>i.url) }
  }
}

export const revalidate = 300

export default async function Page({params}: Props) {
  const p = await client.fetch(postBySlug, {slug: params.slug}, { next:{ tags:['blog', `post:${params.slug}`] } })
  if (!p || p.isPrivate) return null

  const jsonLd = {
    '@context':'https://schema.org',
    '@type':'Article',
    headline: p.title,
    datePublished: p.publishedAt || p._createdAt,
    dateModified: p.updatedAt || p._updatedAt,
    author: { '@type':'Person', name: p.author?.name },
    image: p.coverImage ? [urlFor(p.coverImage).width(1200).height(630).url()] : undefined,
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${p.slug}`
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <h1 className="text-3xl font-bold">{p.title}</h1>
      {p.coverImage && (
        <Image
          src={urlFor(p.coverImage).width(1600).height(900).url()}
          alt={p.title} width={1600} height={900} className="rounded-2xl mt-4 w-full h-auto"
          priority
        />
      )}
      <article className="prose max-w-none mt-6">
        <PortableText value={p.body} />
      </article>
    </main>
  )
}
