import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO & sharing'},
    {name: 'settings', title: 'Settings'},
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Short summary used when there is no SEO description.',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO Title',
      group: 'seo',
      description: 'Title for search engines and social sharing (~60 characters).',
      validation: (rule) => rule.max(70).warning('Over 70 characters may be truncated by search engines.'),
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO Description',
      group: 'seo',
      description: 'Description for search engines and social sharing (~155 characters).',
      validation: (rule) => rule.max(170).warning('Over 170 characters may be truncated by search engines.'),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'settings',
      options: {
        source: 'title',
        // The site resolves posts with lower(slug.current), so keep slugs lowercase.
        slugify: (input: string) =>
          input
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .slice(0, 96),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'postType',
      type: 'string',
      title: 'Type',
      group: 'settings',
      description: 'Blog posts appear in /blog, news in /news.',
      options: {
        list: [
          {title: 'Blog post', value: 'post'},
          {title: 'News', value: 'news'},
        ],
        layout: 'radio',
      },
      initialValue: 'post',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isPrivate',
      type: 'boolean',
      title: 'Private',
      group: 'settings',
      description: 'Hide this post from the website without unpublishing it.',
      initialValue: false,
    }),
    defineField({
      name: 'author',
      type: 'reference',
      group: 'settings',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      group: 'content',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: (rule) => rule.required().warning('Add alt text for accessibility and SEO.'),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
        defineField({
          name: 'attribution',
          type: 'string',
          title: 'Attribution',
        }),
      ]
    }),
      defineField({
        name: 'ogImage',
        type: 'image',
        group: 'seo',
        title: 'Open Graph Image',
        description: 'Image for social sharing (1200x630 recommended)',
        options: {hotspot: true},
        fields: [
          defineField({
            name: 'alt',
            type: 'string',
            title: 'Alternative text',
          })
        ]
      }),
    defineField({
      name: 'categories',
      type: 'array',
      group: 'settings',
      of: [defineArrayMember({type: 'reference', to: {type: 'category'}})],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      group: 'settings',
      description: 'Posts with a future date stay hidden until then.',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      mainImage: 'mainImage',
      seoTitle: 'seoTitle',
      seoDescription: 'seoDescription',
      ogImage: 'ogImage',
      publishedAt: 'publishedAt',
      isPrivate: 'isPrivate',
      postType: 'postType',
    },
    prepare(selection) {
      const {author, publishedAt, isPrivate, postType} = selection
      const date = publishedAt && new Date(publishedAt).toLocaleDateString('es-ES')
      const parts = [isPrivate && '🔒 Private', postType === 'news' && 'News', date, author && `by ${author}`].filter(Boolean)
        return {
          ...selection,
          subtitle: parts.join(' · '),
          description: selection.seoDescription,
          media: selection.ogImage || selection.mainImage
        }
    },
  },
})
