import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { removeCartItemAction } from "@/app/actions/cart";
import { CartItemQuantityForm } from "@/src/components/cart-item-quantity-form";
import { getCart } from "@/src/lib/commerce/cart";
import { readCartCookie } from "@/src/lib/session-cookies";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Cart | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  cart?: string | string[];
  cart_reason?: string | string[];
};

function getFirstValue(input: string | string[] | undefined): string | null {
  if (Array.isArray(input)) {
    return input[0] ?? null;
  }
  return typeof input === "string" ? input : null;
}

function getCartNotice(searchParams: SearchParams | undefined): { type: "success" | "error"; message: string } | null {
  if (!searchParams) {
    return null;
  }

  const cartState = getFirstValue(searchParams.cart);
  const reason = getFirstValue(searchParams.cart_reason);

  if (cartState === "updated") {
    return { type: "success", message: "Cart item quantity updated." };
  }
  if (cartState === "removed") {
    return { type: "success", message: "Item removed from cart." };
  }
  if (cartState !== "error") {
    return null;
  }

  const byReason: Record<string, string> = {
    "missing-cart": "Cart session was not found. Add products before updating cart.",
    "invalid-item": "Cart item reference is invalid.",
    "invalid-quantity": "Quantity must be greater than zero.",
    "update-failed": "Failed to update cart item quantity.",
    "remove-failed": "Failed to remove cart item.",
    "cart-service-unavailable": "Cart service is temporarily unavailable."
  };
  return { type: "error", message: byReason[reason ?? ""] ?? "Cart update failed." };
}

export default async function CartPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const cartNotice = getCartNotice(resolvedSearchParams);
  const cookieStore = await cookies();
  const cartId = readCartCookie(cookieStore);

  if (!cartId) {
    return (
      <section>
        <h1 className={ui.text.pageTitle}>Cart</h1>
        {cartNotice ? (
          <p className={(cartNotice.type === "error" ? ui.state.warning : ui.state.success) + " mt-4"}>
            {cartNotice.message}
          </p>
        ) : null}
        <p className={ui.text.subtitle + " mt-4"}>Your cart is empty.</p>
        <Link href="/" className={ui.text.link + " mt-4"}>
          Continue shopping
        </Link>
      </section>
    );
  }

  let cart;
  try {
    cart = await getCart(cartId);
  } catch {
    return (
      <section>
        <h1 className={ui.text.pageTitle}>Cart</h1>
        <p className={ui.text.subtitle + " mt-4"}>Cart could not be loaded. Create a new cart by adding an item from product pages.</p>
        <Link href="/" className={ui.text.link + " mt-4"}>
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1 className={ui.text.pageTitle}>Cart</h1>
      {cartNotice ? (
        <p className={(cartNotice.type === "error" ? ui.state.warning : ui.state.success) + " mt-4"}>
          {cartNotice.message}
        </p>
      ) : null}
      <p className={ui.text.subtitle + " mt-2"}>Items: {cart.totalQuantity}</p>
      <div className="mt-6 space-y-3">
        {cart.items.map((item) => (
          <article key={item.uid} className={ui.surface.panel}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {item.urlKey ? (
                  <Link href={`/product/${item.urlKey}`} className={ui.text.link}>
                    {item.name}
                  </Link>
                ) : (
                  <h2 className={ui.text.value}>{item.name}</h2>
                )}
                <p className={ui.text.subtitle}>SKU: {item.sku}</p>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <CartItemQuantityForm cartItemUid={item.uid} quantity={item.quantity} />
                  <form action={removeCartItemAction}>
                    <input type="hidden" name="cart_item_uid" value={item.uid} />
                    <button type="submit" className={ui.action.buttonSecondary}>Remove</button>
                  </form>
                </div>
                <p className={ui.text.body + " mt-2 text-sm"}>
                  {item.lineTotal !== null && item.currency ? `${item.currency} ${item.lineTotal.toFixed(2)}` : "Line total unavailable"}
                </p>
              </div>
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-black/8 bg-white">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
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

      <div className={ui.surface.panel + " mt-6"}>
        <p className={ui.text.value}>
          Grand total: {cart.grandTotal !== null && cart.currency ? `${cart.currency} ${cart.grandTotal.toFixed(2)}` : "Unavailable"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/checkout#shipping" className={ui.action.buttonPrimary}>
            Proceed to checkout
          </Link>
          <Link href="/" className={ui.action.buttonSecondary}>
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
