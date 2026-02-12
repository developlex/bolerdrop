import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { CatalogPageView } from "@/src/components/catalog-page-view";
import { getCatalogPageHref, parsePageParam } from "@/src/lib/commerce/pagination";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Products | BoilerDrop Storefront",
  description: "Browse products from BoilerDrop storefront catalog.",
  alternates: {
    canonical: "/"
  }
};

type RootSearchParams = {
  page?: string | string[];
  q?: string | string[];
  [key: string]: string | string[] | undefined;
};

function buildQueryWithoutPage(searchParams: RootSearchParams): string {
  const nextParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        nextParams.append(key, item);
      }
      continue;
    }

    nextParams.set(key, value);
  }
  return nextParams.toString();
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<RootSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawQuery = resolvedSearchParams?.q;
  const searchTerm = Array.isArray(rawQuery) ? (rawQuery[0] ?? "") : (rawQuery ?? "");

  if (resolvedSearchParams?.page !== undefined) {
    const parsedPage = parsePageParam(resolvedSearchParams.page) ?? 1;
    const baseHref = getCatalogPageHref(parsedPage);
    const query = buildQueryWithoutPage(resolvedSearchParams);
    const target = query ? `${baseHref}?${query}` : baseHref;
    permanentRedirect(target);
  }

  return <CatalogPageView page={1} searchTerm={searchTerm} />;
}
