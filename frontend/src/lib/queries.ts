import {groq} from 'next-sanity'

const publicPostFilter =
  `_type=="post" && (!defined(isPrivate) || isPrivate==false) && (!defined(publishedAt) || publishedAt <= now())`;

const newsCategoryFilter = `count((categories[]->slug.current)[@ in ["noticias", "news"]]) > 0`;
const publicBlogFilter = `${publicPostFilter} && !(${newsCategoryFilter})`;
const publicNewsFilter = `${publicPostFilter} && ${newsCategoryFilter}`;

const searchableBlogFilter =
  `${publicBlogFilter} && (!defined($q) || $q == "" || pt::text(body) match $q) && (!defined($tag) || $tag == "" || $tag in tags[]->slug.current) && (!defined($cat) || $cat == "" || $cat in categories[]->slug.current)`;

const searchableNewsFilter =
  `${publicNewsFilter} && (!defined($q) || $q == "" || pt::text(body) match $q) && (!defined($tag) || $tag == "" || $tag in tags[]->slug.current) && (!defined($cat) || $cat == "" || $cat in categories[]->slug.current)`;

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

export const listPosts = groq`*[${publicBlogFilter}] ${orderedPosts} [0...50] ${postFields}`
export const listNewsPosts = groq`*[${publicNewsFilter}] ${orderedPosts} [0...50] ${postFields}`

export const paginatedPosts: string = groq`{
  "items": *[${searchableBlogFilter}] ${orderedPosts} [$offset...$end] ${postFields},
  "total": count(*[${searchableBlogFilter}])
}`

export const paginatedPostsAsc: string = groq`{
  "items": *[${searchableBlogFilter}] | order(coalesce(publishedAt,_updatedAt) asc) [$offset...$end] ${postFields},
  "total": count(*[${searchableBlogFilter}])
}`

export const paginatedNewsPosts: string = groq`{
  "items": *[${searchableNewsFilter}] ${orderedPosts} [$offset...$end] ${postFields},
  "total": count(*[${searchableNewsFilter}])
}`

export const paginatedNewsPostsAsc: string = groq`{
  "items": *[${searchableNewsFilter}] | order(coalesce(publishedAt,_updatedAt) asc) [$offset...$end] ${postFields},
  "total": count(*[${searchableNewsFilter}])
}`

// Query for highlighted/featured posts (category = "Destacado" or "highlighted")
export const highlightedPosts = groq`*[${publicBlogFilter} && count((categories[]->slug.current)[@ in ["destacado", "highlighted"]]) > 0] ${orderedPosts} [0...10] ${postFields}`
export const highlightedNewsPosts = groq`*[${publicNewsFilter} && count((categories[]->slug.current)[@ in ["destacado", "highlighted"]]) > 0] ${orderedPosts} [0...10] ${postFields}`
