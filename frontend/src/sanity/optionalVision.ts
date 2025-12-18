// Helper to optionally require @sanity/vision at runtime.
// This avoids importing it at module evaluation time which can trigger
// jsdom/isomorphic-dompurify file resolution during builds.
export function getVisionPlugin(apiVersion: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { visionTool } = require('@sanity/vision');
    return visionTool({ defaultApiVersion: apiVersion });
  } catch {
    return undefined;
  }
}
