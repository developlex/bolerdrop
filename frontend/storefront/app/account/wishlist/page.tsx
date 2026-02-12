import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect, requireAccountToken } from "@/app/account/_lib";
import { removeWishlistItemAction, updateWishlistItemQuantityAction } from "@/app/actions/account-management";
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
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>My Wish List</h1>
        <p className={ui.text.subtitle + " mt-2"}>Wishlist items are synced with Magento customer wishlists.</p>
        {updated ? <p className={ui.state.success + " mt-4"}>Wishlist updated.</p> : null}
        {error ? <p className={ui.state.warning + " mt-4"}>{error}</p> : null}
      </section>

      {!wishlist || wishlist.items.length === 0 ? (
        <section className={ui.surface.panel}>
          <p className={ui.text.subtitle}>You have no items in your wish list.</p>
        </section>
      ) : (
        <section className={ui.surface.panel}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className={ui.text.value}>Wishlist #{wishlist.id}</p>
            <p className={ui.text.subtitle}>{wishlist.itemsCount} item(s)</p>
          </div>
          <div className="space-y-3">
            {wishlist.items.map((item) => (
              <article key={item.id} className="rounded-xl border border-black/10 bg-white/70 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {item.product?.urlKey ? (
                      <Link href={`/product/${item.product.urlKey}`} className={ui.text.link}>
                        {item.product.name || item.product.sku}
                      </Link>
                    ) : (
                      <p className={ui.text.value}>{item.product?.name || item.product?.sku || "Unknown product"}</p>
                    )}
                    <p className={ui.text.subtitle + " mt-1"}>
                      SKU: {item.product?.sku || "n/a"} · {toMoney(item.product?.price ?? null, item.product?.currency ?? null)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={updateWishlistItemQuantityAction} className="flex items-center gap-2">
                      <input type="hidden" name="wishlist_id" value={wishlist.id} />
                      <input type="hidden" name="item_id" value={item.id} />
                      <input
                        name="quantity"
                        type="number"
                        min={1}
                        step={1}
                        defaultValue={item.quantity}
                        className={ui.form.inputCompact}
                      />
                      <button type="submit" className={ui.action.buttonSecondary}>Update</button>
                    </form>
                    <form action={removeWishlistItemAction}>
                      <input type="hidden" name="wishlist_id" value={wishlist.id} />
                      <input type="hidden" name="item_id" value={item.id} />
                      <button type="submit" className={ui.action.buttonSecondary}>Remove</button>
                    </form>
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
