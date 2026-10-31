import {groq} from 'next-sanity'

const publicPostFilter =
  `_type=="post" && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())`;

const publicBlogFilter = `${publicPostFilter} && postType != "news"`;
const publicNewsFilter = `${publicPostFilter} && postType == "news"`;

const searchableBlogFilter =
  `${publicBlogFilter} && (!defined($q) || $q == "" || pt::text(body) match $q) && (!defined($cat) || $cat == "" || $cat in categories[]->slug.current)`;

const searchableNewsFilter =
  `${publicNewsFilter} && (!defined($q) || $q == "" || pt::text(body) match $q) && (!defined($cat) || $cat == "" || $cat in categories[]->slug.current)`;

const orderedPosts = '| order(coalesce(publishedAt,_updatedAt) desc)';

// Shared projection. `readingMinutes` assumes ~200 words/min at ~5.5 chars/word.
const cardFieldsInner = `
  _id,
  _createdAt,
  _updatedAt,
  postType,
  title,
  seoTitle,
  seoDescription,
  ogImage { asset, alt },
  mainImage { asset, alt, caption, attribution },
  "slug": lower(slug.current),
  excerpt,
  "categories": categories[]-> {
    _id,
    title,
    "slug": slug.current,
    ogImage { asset, alt }
  },
  "author": author-> { name, image { asset, alt } },
  "readingMinutes": round(length(pt::text(body)) / 1100),
  publishedAt,
  updatedAt,
  isPrivate`

// Lists never need the (large) body.
export const postCardFields = groq`{${cardFieldsInner}
}`

export const postFields = groq`{${cardFieldsInner},
  body[] {
    ...,
    _type == "video" => {
      ...,
      "url": file.asset->url,
      poster { asset }
    }
  }
}`

export const allPublicSlugs = groq`*[${publicPostFilter} && defined(slug.current)].slug.current`

export const postBySlug = groq`*[_type=="post" && lower(slug.current)==$slug && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())][0] ${postFields}`

export const listPosts = groq`*[${publicBlogFilter}] ${orderedPosts} [0...50] ${postCardFields}`
export const listNewsPosts = groq`*[${publicNewsFilter}] ${orderedPosts} [0...50] ${postCardFields}`

export const paginatedPosts: string = groq`{
  "items": *[${searchableBlogFilter}] ${orderedPosts} [$offset...$end] ${postCardFields},
  "total": count(*[${searchableBlogFilter}])
}`

export const paginatedPostsAsc: string = groq`{
  "items": *[${searchableBlogFilter}] | order(coalesce(publishedAt,_updatedAt) asc) [$offset...$end] ${postCardFields},
  "total": count(*[${searchableBlogFilter}])
}`

export const paginatedNewsPosts: string = groq`{
  "items": *[${searchableNewsFilter}] ${orderedPosts} [$offset...$end] ${postCardFields},
  "total": count(*[${searchableNewsFilter}])
}`

export const paginatedNewsPostsAsc: string = groq`{
  "items": *[${searchableNewsFilter}] | order(coalesce(publishedAt,_updatedAt) asc) [$offset...$end] ${postCardFields},
  "total": count(*[${searchableNewsFilter}])
}`

// Query for highlighted/featured posts (category = "Destacado" or "highlighted")
export const highlightedPosts = groq`*[${publicBlogFilter} && count((categories[]->slug.current)[@ in ["destacado", "highlighted"]]) > 0] ${orderedPosts} [0...10] ${postCardFields}`
export const highlightedNewsPosts = groq`*[${publicNewsFilter} && count((categories[]->slug.current)[@ in ["destacado", "highlighted"]]) > 0] ${orderedPosts} [0...10] ${postCardFields}`

// Up to 3 posts of the same type, most shared categories first, then newest.
export const relatedPosts = groq`*[${publicPostFilter} && _id != $id && coalesce(postType, "post") == $postType] {
  ${cardFieldsInner},
  "shared": count((categories[]._ref)[@ in $categoryIds])
} | order(shared desc, coalesce(publishedAt,_updatedAt) desc) [0...3]`
