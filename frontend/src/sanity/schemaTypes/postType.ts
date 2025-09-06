import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
      defineField({
        name: 'seoTitle',
        type: 'string',
        title: 'SEO Title',
        description: 'Title for search engines and social sharing.'
      }),
      defineField({
        name: 'seoDescription',
        type: 'text',
        title: 'SEO Description',
        description: 'Description for search engines and social sharing.'
      }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
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
      of: [defineArrayMember({type: 'reference', to: {type: 'category'}})],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
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
    },
    prepare(selection) {
      const {author} = selection
        return {
          ...selection,
          subtitle: author && `by ${author}`,
          description: selection.seoDescription,
          media: selection.ogImage || selection.mainImage
        }
    },
  },
})
