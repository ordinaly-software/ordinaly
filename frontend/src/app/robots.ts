import type { MetadataRoute } from "next";
import { absoluteAssetUrl, metadataBaseUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [absoluteAssetUrl("/sitemap.xml")],
    host: metadataBaseUrl,
  };
}
