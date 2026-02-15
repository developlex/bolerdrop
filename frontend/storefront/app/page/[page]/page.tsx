import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CatalogPageView } from "@/src/components/catalog-page-view";
import { DEFAULT_PAGE_SIZE, parsePageParam, parsePageSizeParam } from "@/src/lib/commerce/pagination";

type CatalogPageRouteProps = {
  params: Promise<{ page: string }>;
  searchParams?: Promise<{ q?: string | string[]; size?: string | string[] }>;
};

function buildRootQuery(searchTerm: string, pageSize: number): string {
  const params = new URLSearchParams();
  if (searchTerm.trim()) {
    params.set("q", searchTerm.trim());
  }
  if (pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("size", String(pageSize));
  }
  return params.toString();
}

export async function generateMetadata({ params }: CatalogPageRouteProps): Promise<Metadata> {
  const resolvedParams = await params;
  const parsedPage = parsePageParam(resolvedParams.page);

  if (parsedPage === null || parsedPage <= 1) {
    return {
      title: "Products | BoilerDrop Storefront",
      alternates: {
        canonical: "/"
      }
    };
  }

  return {
    title: `Products - Page ${parsedPage} | BoilerDrop Storefront`,
    alternates: {
      canonical: `/page/${parsedPage}`
    }
  };
}

export default async function CatalogPageRoute({ params, searchParams }: CatalogPageRouteProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const parsedPage = parsePageParam(resolvedParams.page);
  const rawQuery = resolvedSearchParams?.q;
  const rawSize = resolvedSearchParams?.size;
  const searchTerm = Array.isArray(rawQuery) ? (rawQuery[0] ?? "") : (rawQuery ?? "");
  const pageSize = parsePageSizeParam(rawSize);

  if (parsedPage === null) {
    notFound();
  }

  if (parsedPage === 1) {
    const query = buildRootQuery(searchTerm, pageSize);
    permanentRedirect(query ? `/?${query}` : "/");
  }

  return <CatalogPageView page={parsedPage} searchTerm={searchTerm} pageSize={pageSize} />;
}
