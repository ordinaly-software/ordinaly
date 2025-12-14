import {groq} from 'next-sanity'

const publicPostFilter =
  `_type=="post" && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())`;

const searchablePostFilter =
  `${publicPostFilter} && (!defined($q) || $q == "" || pt::text(body) match $q) && (!defined($tag) || $tag == "" || $tag in tags[]->slug.current) && (!defined($cat) || $cat == "" || $cat in categories[]->slug.current)`;

const orderedPosts = '| order(coalesce(publishedAt,_updatedAt) desc)';

// Common projection
export const postFields = groq`{
  _id,
  postType,
  title,
  seoTitle,
  seoDescription,
  ogImage { asset, alt },
  mainImage { asset, alt },
  "slug": slug.current,
  excerpt,
  coverImage { asset, alt },
  body,
  lang,
  "categories": categories[]-> {
    _id,
    title,
    "slug": slug.current,
    ogImage { asset, alt }
  },
  "tags": tags[]-> { title, "slug": slug.current },
  "author": author-> { name, avatar },
  publishedAt,
  updatedAt,
  isPrivate
}`

export const allPublicSlugs = groq`*[${publicPostFilter} && defined(slug.current)].slug.current`

export const postBySlug = groq`*[_type=="post" && slug.current==$slug && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())][0] ${postFields}`

export const listPosts = groq`*[${publicPostFilter}] ${orderedPosts} [0...50] ${postFields}`

export const paginatedPosts = groq`{
  "items": *[${searchablePostFilter}] ${orderedPosts} [$offset...$end] ${postFields},
  "total": count(*[${searchablePostFilter}])
}`
