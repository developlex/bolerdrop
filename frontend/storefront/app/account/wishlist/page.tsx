import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect, requireAccountToken } from "@/app/account/_lib";
import { removeWishlistItemAction } from "@/app/actions/account-management";
import { addToCartAction } from "@/app/actions/cart";
import { getCustomerWishlist } from "@/src/lib/commerce/customer";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "My Wish List | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  updated?: string | string[];
  wishlist?: string | string[];
  error?: string | string[];
};

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

function resolveErrorMessage(searchParams?: SearchParams): string | null {
  const error = firstValue(searchParams?.error);
  if (!error) {
    return null;
  }
  const byCode: Record<string, string> = {
    "invalid-item": "Wishlist item data is invalid.",
    "wishlist-invalid-sku": "Wishlist request is missing product SKU.",
    "invalid-quantity": "Wishlist quantity must be greater than zero.",
    "wishlist-add-failed": "Unable to add product to wish list.",
    "remove-failed": "Unable to remove wishlist item.",
    "update-failed": "Unable to update wishlist quantity.",
    "wishlist-service-unavailable": "Wishlist service is temporarily unavailable.",
    "service-unavailable": "Wishlist service is temporarily unavailable."
  };
  return byCode[error] ?? "Wishlist update failed.";
}

function toMoney(value: number | null, currency: string | null): string {
  if (value === null || !currency) {
    return "n/a";
  }
  return `${value.toFixed(2)} ${currency}`;
}

export default async function AccountWishlistPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const token = await requireAccountToken();
  const [dashboard, wishlist, resolvedSearchParams] = await Promise.all([
    getDashboardOrRedirect(),
    getCustomerWishlist(token, 50, 1),
    searchParams ? searchParams : Promise.resolve(undefined)
  ]);
  const updated = firstValue(resolvedSearchParams?.updated) === "1" || firstValue(resolvedSearchParams?.wishlist) === "added";
  const error = resolveErrorMessage(resolvedSearchParams);

  return (
    <AccountShell dashboard={dashboard} active="wishlist">
      {updated ? <p className={ui.state.success}>Wishlist updated.</p> : null}
      {error ? <p className={ui.state.warning}>{error}</p> : null}

      {!wishlist || wishlist.items.length === 0 ? (
        <section className={ui.surface.panel}>
          <p className={ui.text.subtitle}>You have no items in your wish list.</p>
        </section>
      ) : (
        <section className={ui.surface.panel}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className={ui.text.value}>Wish list</p>
            <p className={ui.text.subtitle}>{wishlist.itemsCount} item(s)</p>
          </div>
          <div className="space-y-3">
            {wishlist.items.map((item) => (
              <article key={item.id} className="rounded-xl border border-black/10 bg-white/70 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {item.product?.urlKey ? (
                      <Link href={`/product/${item.product.urlKey}`} className={ui.text.link}>
                        {item.product.name || item.product.sku}
                      </Link>
                    ) : (
                      <p className={ui.text.value}>{item.product?.name || item.product?.sku || "Unknown product"}</p>
                    )}
                    <p className={ui.text.subtitle + " mt-1"}>
                      SKU: {item.product?.sku || "n/a"} ·{" "}
                      <span className="font-semibold text-ink">
                        {toMoney(item.product?.price ?? null, item.product?.currency ?? null)}
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.product?.sku ? (
                      <form action={addToCartAction} className="flex items-center gap-2">
                        <input type="hidden" name="sku" value={item.product.sku} />
                        <input
                          name="quantity"
                          type="number"
                          min={1}
                          step={1}
                          defaultValue={item.quantity}
                          className={ui.form.inputCompact}
                        />
                        <button type="submit" className={ui.action.buttonSecondary}>Add to cart</button>
                      </form>
                      ) : null}
                      <form action={removeWishlistItemAction}>
                        <input type="hidden" name="wishlist_id" value={wishlist.id} />
                        <input type="hidden" name="item_id" value={item.id} />
                        <button type="submit" className={ui.action.buttonSecondary}>Remove</button>
                      </form>
                    </div>
                  </div>
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-black/8 bg-white">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product?.name || "Wishlist product"} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-center text-xs text-steel">
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </AccountShell>
  );
}
