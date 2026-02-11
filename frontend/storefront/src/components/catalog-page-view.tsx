import Link from "next/link";
import { ProductCard } from "@/src/components/product-card";
import { getCatalogPage } from "@/src/lib/commerce/catalog";
import { CommerceError } from "@/src/lib/commerce/client";
import { getCatalogPageHref } from "@/src/lib/commerce/pagination";
import { ui } from "@/src/ui/styles";

type CatalogPageViewProps = {
  page: number;
};

export async function CatalogPageView({ page }: CatalogPageViewProps) {
  try {
    const catalog = await getCatalogPage(12, page);
    const prevPage = Math.max(1, catalog.currentPage - 1);
    const nextPage = Math.min(catalog.totalPages, catalog.currentPage + 1);

    return (
      <section>
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h1 className={ui.text.pageTitle}>Products</h1>
            <p className={ui.text.subtitle + " mt-1"}>
              {catalog.totalCount} item{catalog.totalCount === 1 ? "" : "s"} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={getCatalogPageHref(prevPage)}
              aria-disabled={!catalog.hasPreviousPage}
              className={`${ui.action.buttonSecondary} ${catalog.hasPreviousPage ? "" : "pointer-events-none opacity-50"}`}
            >
              Prev
            </Link>
            <span className={ui.text.subtitle}>
              Page {catalog.currentPage} / {catalog.totalPages}
            </span>
            <Link
              href={getCatalogPageHref(nextPage)}
              aria-disabled={!catalog.hasNextPage}
              className={`${ui.action.buttonSecondary} ${catalog.hasNextPage ? "" : "pointer-events-none opacity-50"}`}
            >
              Next
            </Link>
          </div>
        </div>

        {catalog.products.length === 0 ? (
          <p className={ui.state.warning}>
            No catalog data returned from Magento GraphQL.
          </p>
        ) : (
          <div className={ui.grid.catalog}>
            {catalog.products.map((product) => (
              <ProductCard key={product.id || product.sku} product={product} />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error: unknown) {
    const message = error instanceof CommerceError ? error.message : "Unexpected storefront catalog failure";
    return (
      <section>
        <h1 className={ui.text.pageTitle + " mb-6"}>Products</h1>
        <p className={ui.state.warning}>
          Catalog request failed: {message}
        </p>
      </section>
    );
  }
}
