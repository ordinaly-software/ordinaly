import {createClient} from '@sanity/client'
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2025-02-19',
  perspective: 'published',
  useCdn: true,
})
