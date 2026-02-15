"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { addSimpleSkuToCart, createEmptyCart, removeCartItem, updateCartItemQuantity } from "@/src/lib/commerce/cart";
import { deleteCartCookie, readCartCookie, setCartCookie } from "@/src/lib/session-cookies";

function cartRedirect(params: Record<string, string>): never {
  const query = new URLSearchParams(params);
  redirect(`/cart?${query.toString()}`);
}

function isMissingCartError(error: unknown): boolean {
  return error instanceof CommerceError && error.message.toLowerCase().includes("could not find a cart with id");
}

export async function addToCartAction(formData: FormData): Promise<void> {
  const sku = String(formData.get("sku") ?? "").trim();
  const quantityValue = Number(formData.get("quantity") ?? "1");
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;

  if (!sku) {
    redirect("/?error=missing-sku");
  }

  const cookieStore = await cookies();
  let cartId = readCartCookie(cookieStore);

  if (!cartId) {
    cartId = await createEmptyCart();
    setCartCookie(cookieStore, cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
  }

  try {
    await addSimpleSkuToCart(cartId, sku, quantity);
  } catch (error: unknown) {
    if (!isMissingCartError(error)) {
      throw error;
    }
    deleteCartCookie(cookieStore);
    const newCartId = await createEmptyCart();
    setCartCookie(cookieStore, newCartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    await addSimpleSkuToCart(newCartId, sku, quantity);
  }
  redirect("/cart");
}

export async function updateCartItemAction(formData: FormData): Promise<void> {
  const cartItemUid = String(formData.get("cart_item_uid") ?? "").trim();
  const quantityValue = Number(formData.get("quantity") ?? "");
  const quantity = Number.isFinite(quantityValue) ? quantityValue : NaN;

  if (!cartItemUid) {
    cartRedirect({ cart: "error", cart_reason: "invalid-item" });
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    cartRedirect({ cart: "error", cart_reason: "invalid-quantity" });
  }

  const cookieStore = await cookies();
  const cartId = readCartCookie(cookieStore);
  if (!cartId) {
    cartRedirect({ cart: "error", cart_reason: "missing-cart" });
  }

  try {
    await updateCartItemQuantity(cartId, cartItemUid, quantity);
  } catch (error: unknown) {
    if (error instanceof CommerceError) {
      cartRedirect({ cart: "error", cart_reason: "update-failed" });
    }
    cartRedirect({ cart: "error", cart_reason: "cart-service-unavailable" });
  }

  cartRedirect({ cart: "updated" });
}

export async function removeCartItemAction(formData: FormData): Promise<void> {
  const cartItemUid = String(formData.get("cart_item_uid") ?? "").trim();
  if (!cartItemUid) {
    cartRedirect({ cart: "error", cart_reason: "invalid-item" });
  }

  const cookieStore = await cookies();
  const cartId = readCartCookie(cookieStore);
  if (!cartId) {
    cartRedirect({ cart: "error", cart_reason: "missing-cart" });
  }

  try {
    const updatedCart = await removeCartItem(cartId, cartItemUid);
    if (updatedCart.items.length === 0) {
      deleteCartCookie(cookieStore);
    }
  } catch (error: unknown) {
    if (error instanceof CommerceError) {
      cartRedirect({ cart: "error", cart_reason: "remove-failed" });
    }
    cartRedirect({ cart: "error", cart_reason: "cart-service-unavailable" });
  }

  cartRedirect({ cart: "removed" });
}
