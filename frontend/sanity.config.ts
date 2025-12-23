'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {getVisionPlugin} from './src/sanity/optionalVision'

// Lazily require `sanity` and `sanity/structure` to avoid triggering
// isomorphic-dompurify/jsdom asset resolution during module evaluation.
// If require fails, fall back to safe no-op values so the config file
// can still be imported (Studio might run without optional plugins).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let defineConfig: any = (c: any) => c
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let structureTool: any = () => undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  const sanity = require('sanity')
  defineConfig = sanity?.defineConfig ?? sanity?.default?.defineConfig ?? sanity

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  const structureMod = require('sanity/structure')
  structureTool = structureMod?.structureTool ?? structureMod?.default?.structureTool ?? structureMod
} catch (err) {
  // swallow — keep defaults so config file remains importable in constrained environments
}

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {structure} from './src/sanity/structure'

import {schema} from './src/sanity/schemaTypes'

const visionPlugin = getVisionPlugin(apiVersion)

export default defineConfig({
  name: 'default',
  title: 'Ordinaly Software CMS',
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: { types: schema.types },
  plugins: [structureTool({structure}), visionPlugin].filter(Boolean),
})
