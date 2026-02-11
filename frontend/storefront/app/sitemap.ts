import type { MetadataRoute } from "next";
import { getCatalogPage } from "@/src/lib/commerce/catalog";
import { getCatalogPageHref } from "@/src/lib/commerce/pagination";
import { absoluteStorefrontUrl } from "@/src/lib/seo";

const SITEMAP_PAGE_SIZE = 100;
const SITEMAP_MAX_CATALOG_PAGES = 20;

export const revalidate = 3600;

function toSitemapEntry(
  path: string,
  priority: number,
  changeFrequency: "hourly" | "daily" | "weekly",
  lastModified: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteStorefrontUrl(path),
    lastModified,
    changeFrequency,
    priority
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    toSitemapEntry("/", 1, "hourly", now)
  ];

  try {
    const firstPage = await getCatalogPage(SITEMAP_PAGE_SIZE, 1);
    const cappedTotalPages = Math.min(firstPage.totalPages, SITEMAP_MAX_CATALOG_PAGES);

    for (let pageNumber = 2; pageNumber <= cappedTotalPages; pageNumber += 1) {
      entries.push(
        toSitemapEntry(getCatalogPageHref(pageNumber), 0.8, "daily", now)
      );
    }

    const catalogPages = [firstPage];
    for (let pageNumber = 2; pageNumber <= cappedTotalPages; pageNumber += 1) {
      const page = await getCatalogPage(SITEMAP_PAGE_SIZE, pageNumber);
      catalogPages.push(page);
    }

    const seenProductUrls = new Set<string>();
    for (const page of catalogPages) {
      for (const product of page.products) {
        const path = `/product/${encodeURIComponent(product.urlKey)}`;
        const key = absoluteStorefrontUrl(path);
        if (seenProductUrls.has(key)) {
          continue;
        }
        seenProductUrls.add(key);
        entries.push(toSitemapEntry(path, 0.7, "daily", now));
      }
    }
  } catch {
    return entries;
  }

  return entries;
}
