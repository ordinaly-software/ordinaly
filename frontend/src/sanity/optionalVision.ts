// Helper to optionally require @sanity/vision at runtime.
// This avoids importing it at module evaluation time which can trigger
// jsdom/isomorphic-dompurify file resolution during builds.
export function getVisionPlugin(apiVersion: string) {
  try {
    // Use require in a try/catch so missing or problematic packages won't crash the config.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // @ts-ignore
    const {visionTool} = require('@sanity/vision')
    return visionTool({defaultApiVersion: apiVersion})
  } catch (err) {
    return undefined
  }
}
