// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { client } from './client'

// Manual implementation for next-sanity v11.x compatibility
export const SanityLive = {
  fetch: async (query: string, params?: Record<string, unknown>, options?: Record<string, unknown>) => {
    return client.fetch(query, params, options);
  }
};

// Alias for compatibility
export const sanityFetch = SanityLive.fetch;