"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { addSimpleSkuToCart, createEmptyCart } from "@/src/lib/commerce/cart";

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
