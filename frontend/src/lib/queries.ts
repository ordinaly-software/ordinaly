import {groq} from 'next-sanity'

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

export const allPublicSlugs = groq`*[_type=="post" && (!defined(isPrivate) || isPrivate==false) && defined(slug.current)].slug.current`

export const postBySlug = groq`*[_type=="post" && slug.current==$slug][0] ${postFields}`

export const listPosts = groq`*[_type=="post" && (!defined(isPrivate) || isPrivate==false)]
| order(coalesce(publishedAt,_updatedAt) desc) [0...50] ${postFields}`

export const searchPosts = groq`*[_type=="post" &&
  (!defined(isPrivate) || isPrivate==false) &&
  (!defined($q) || pt::text(body) match $q) &&
  (!defined($tag) || $tag in tags[]->slug.current) &&
  (!defined($cat) || $cat in categories[]->slug.current)
]| order(coalesce(publishedAt,_updatedAt) desc) [0...50] ${postFields}`
