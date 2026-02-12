import Link from "next/link";
import { ProductCard } from "@/src/components/product-card";
import { getCatalogPage } from "@/src/lib/commerce/catalog";
import { CommerceError } from "@/src/lib/commerce/client";
import { getCatalogPageHref } from "@/src/lib/commerce/pagination";
import { ui } from "@/src/ui/styles";

type CatalogPageViewProps = {
  page: number;
  searchTerm?: string;
};

function buildCatalogHref(page: number, searchTerm: string): string {
  const base = getCatalogPageHref(page);
  const normalizedSearch = searchTerm.trim();
  if (!normalizedSearch) {
    return base;
  }
  const params = new URLSearchParams({ q: normalizedSearch });
  return `${base}?${params.toString()}`;
}

export async function CatalogPageView({ page, searchTerm = "" }: CatalogPageViewProps) {
  try {
    const catalog = await getCatalogPage(12, page, searchTerm);
    const prevPage = Math.max(1, catalog.currentPage - 1);
    const nextPage = Math.min(catalog.totalPages, catalog.currentPage + 1);

    return (
      <section className="space-y-8">
        <section className={ui.surface.panelLg}>
          <div className="mx-auto max-w-3xl text-center">
            <p className={ui.text.label}>Headless storefront</p>
            <h1 className={ui.text.heroTitle + " mt-2"}>
              Discover curated products for modern stores
            </h1>
            <p className={ui.text.subtitle + " mt-4 text-base"}>
              Catalog, cart, and checkout are powered by Magento GraphQL with a decoupled storefront runtime.
            </p>
            <form action="/" method="get" className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <input
                name="q"
                defaultValue={searchTerm}
                className={ui.form.input}
                placeholder="Search catalog..."
              />
              <button type="submit" className={ui.action.buttonPrimary}>
                Search
              </button>
              {searchTerm ? (
                <Link href="/" className={ui.action.buttonSecondary}>
                  Reset
                </Link>
              ) : null}
            </form>
            <div className="mt-7 flex justify-center">
              <Link href="#products" className={ui.action.buttonHero}>
                Shop now
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className={ui.surface.panel}>
              <p className={ui.text.value}>Fast shipping</p>
              <p className={ui.text.subtitle + " mt-1"}>Operational-ready demo fulfillment profile.</p>
            </div>
            <div className={ui.surface.panel}>
              <p className={ui.text.value}>Secure checkout</p>
              <p className={ui.text.subtitle + " mt-1"}>Guest and customer checkout with server-side validation.</p>
            </div>
            <div className={ui.surface.panel}>
              <p className={ui.text.value}>Composable design</p>
              <p className={ui.text.subtitle + " mt-1"}>Switch theme profile per instance without code changes.</p>
            </div>
          </div>
        </section>

        <div id="products" className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={ui.text.pageTitle}>Products</h2>
            <p className={ui.text.subtitle + " mt-1"}>
              {catalog.totalCount} item{catalog.totalCount === 1 ? "" : "s"} found
            </p>
            {searchTerm ? (
              <p className={ui.text.subtitle + " mt-1"}>
                Search: "{searchTerm}" ·{" "}
                <Link href="/" className={ui.text.link}>
                  Back to full catalog
                </Link>
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={buildCatalogHref(prevPage, searchTerm)}
              aria-disabled={!catalog.hasPreviousPage}
              className={`${ui.action.buttonSecondary} ${catalog.hasPreviousPage ? "" : "pointer-events-none opacity-50"}`}
            >
              Prev
            </Link>
            <span className={ui.text.subtitle}>
              Page {catalog.currentPage} / {catalog.totalPages}
            </span>
            <Link
              href={buildCatalogHref(nextPage, searchTerm)}
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
          <div className={`${ui.grid.catalog} stagger-grid`}>
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
