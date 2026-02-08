import type { MetadataRoute } from "next";
import { absoluteAssetUrl, metadataBaseUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/auth/",
          "/es/auth/",
          "/en/auth/",
          "/profile/",
          "/studio/",
          "/odoo/",
          "/es/odoo/",
          "/en/odoo/",
          "/n8n/",
          "/es/n8n/",
          "/en/n8n/",
          "/mail/",
          "/es/mail/",
          "/en/mail/",
        ],
      },
    ],
    sitemap: [absoluteAssetUrl("/sitemap.xml")],
    host: metadataBaseUrl,
  };
}
