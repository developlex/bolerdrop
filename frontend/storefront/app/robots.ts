import type { MetadataRoute } from "next";
import { getStorefrontBaseUrl } from "@/src/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getStorefrontBaseUrl();
  const origin = baseUrl.origin;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    host: origin,
    sitemap: `${origin}/sitemap.xml`
  };
}
