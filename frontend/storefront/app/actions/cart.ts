"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { addSimpleSkuToCart, createEmptyCart, removeCartItem, updateCartItemQuantity } from "@/src/lib/commerce/cart";

function cartRedirect(params: Record<string, string>): never {
  const query = new URLSearchParams(params);
  redirect(`/cart?${query.toString()}`);
}

export async function addToCartAction(formData: FormData): Promise<void> {
  const sku = String(formData.get("sku") ?? "").trim();
  const quantityValue = Number(formData.get("quantity") ?? "1");
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;

  if (!sku) {
    redirect("/?error=missing-sku");
  }

  const cookieStore = await cookies();
  let cartId = cookieStore.get("cart_id")?.value;

  if (!cartId) {
    cartId = await createEmptyCart();
    cookieStore.set("cart_id", cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
  }

  await addSimpleSkuToCart(cartId, sku, quantity);
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
  const cartId = cookieStore.get("cart_id")?.value;
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
  const cartId = cookieStore.get("cart_id")?.value;
  if (!cartId) {
    cartRedirect({ cart: "error", cart_reason: "missing-cart" });
  }

  try {
    const updatedCart = await removeCartItem(cartId, cartItemUid);
    if (updatedCart.items.length === 0) {
      cookieStore.delete("cart_id");
    }
  } catch (error: unknown) {
    if (error instanceof CommerceError) {
      cartRedirect({ cart: "error", cart_reason: "remove-failed" });
    }
    cartRedirect({ cart: "error", cart_reason: "cart-service-unavailable" });
  }

  cartRedirect({ cart: "removed" });
}
