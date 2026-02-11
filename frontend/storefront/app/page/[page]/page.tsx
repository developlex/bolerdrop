import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CatalogPageView } from "@/src/components/catalog-page-view";
import { parsePageParam } from "@/src/lib/commerce/pagination";

type CatalogPageRouteProps = {
  params: Promise<{ page: string }>;
};

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

export default async function CatalogPageRoute({ params }: CatalogPageRouteProps) {
  const resolvedParams = await params;
  const parsedPage = parsePageParam(resolvedParams.page);

  if (parsedPage === null) {
    notFound();
  }

  if (parsedPage === 1) {
    permanentRedirect("/");
  }

  return <CatalogPageView page={parsedPage} />;
}
