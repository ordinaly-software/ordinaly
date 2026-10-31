import {defineType, defineArrayMember, defineField} from 'sanity'
import {ImageIcon, PlayIcon, VideoIcon, CodeBlockIcon} from '@sanity/icons'

/**
 * This is the schema type for block content used in the post document type
 * Importing this type into the studio configuration's `schema` property
 * lets you reuse it in other document types with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */

const YOUTUBE_HOSTS = ['youtu.be', 'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com']

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // Styles let you define what blocks can be marked up as. The default
      // set corresponds with HTML tags, but you can set any title or value
      // you want, and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      // Marks let you mark up inline text in the Portable Text Editor
      marks: {
        // Decorators usually describe a single property - e.g. a typographic
        // preference or highlighting
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Underline', value: 'underline'},
          {title: 'Strike', value: 'strike-through'},
          {title: 'Code', value: 'code'},
        ],
        // Annotations can be any object structure - e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                description: 'Absolute URL (https://…) or an internal path (/blog).',
                validation: (rule) =>
                  rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
              },
              {
                title: 'Open in a new tab',
                name: 'blank',
                type: 'boolean',
                initialValue: false,
              },
            ],
          },
        ],
      },
    }),
    // You can add additional types here. Note that you can't use
    // primitive types such as 'string' and 'number' in the same array
    // as a block type.
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Describe the image for screen readers and search engines.',
          validation: (rule) => rule.required().warning('Add alt text for accessibility and SEO.'),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Shown below the image.',
        }),
        defineField({
          name: 'attribution',
          type: 'string',
          title: 'Attribution',
          description: 'Credit, e.g. “Photo: Jane Doe / Unsplash”.',
        }),
      ],
    }),
    defineArrayMember({
      name: 'youtube',
      title: 'YouTube video',
      type: 'object',
      icon: PlayIcon,
      fields: [
        defineField({
          name: 'url',
          type: 'url',
          title: 'YouTube URL',
          description: 'Watch, youtu.be, Shorts or live links all work.',
          validation: (rule) =>
            rule.required().custom((value) => {
              if (!value) return true
              try {
                const {hostname} = new URL(value)
                return YOUTUBE_HOSTS.includes(hostname.toLowerCase()) || 'Must be a YouTube link'
              } catch {
                return 'Invalid URL'
              }
            }),
        }),
        defineField({
          name: 'title',
          type: 'string',
          title: 'Accessible title',
          description: 'Short description of the video (used as the player title).',
        }),
        defineField({name: 'caption', type: 'string', title: 'Caption'}),
      ],
      preview: {
        select: {title: 'title', subtitle: 'url', caption: 'caption'},
        prepare: ({title, subtitle, caption}) => ({
          title: title || caption || 'YouTube video',
          subtitle,
        }),
      },
    }),
    defineArrayMember({
      name: 'video',
      title: 'Uploaded video',
      type: 'object',
      icon: VideoIcon,
      fields: [
        defineField({
          name: 'file',
          type: 'file',
          title: 'Video file',
          options: {accept: 'video/mp4,video/webm'},
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'poster',
          type: 'image',
          title: 'Poster image',
          description: 'Optional still shown before playback.',
        }),
        defineField({name: 'caption', type: 'string', title: 'Caption'}),
      ],
      preview: {
        select: {title: 'caption', media: 'poster'},
        prepare: ({title, media}) => ({title: title || 'Uploaded video', media}),
      },
    }),
    defineArrayMember({
      name: 'codeBlock',
      title: 'Code block',
      type: 'object',
      icon: CodeBlockIcon,
      fields: [
        defineField({name: 'code', type: 'text', title: 'Code', rows: 8, validation: (r) => r.required()}),
        defineField({name: 'filename', type: 'string', title: 'File name / language'}),
      ],
      preview: {
        select: {title: 'filename', subtitle: 'code'},
        prepare: ({title, subtitle}) => ({title: title || 'Code block', subtitle}),
      },
    }),
  ],
})
