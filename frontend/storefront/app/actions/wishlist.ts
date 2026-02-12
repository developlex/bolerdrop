"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { addProductToWishlist } from "@/src/lib/commerce/customer";

function appendQuery(path: string, key: string, value: string): string {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set(key, value);
  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

export async function addToWishlistAction(formData: FormData): Promise<void> {
  const sku = String(formData.get("sku") ?? "").trim();
  const quantityRaw = Number(formData.get("quantity") ?? "1");
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;
  const returnTo = String(formData.get("return_to") ?? "").trim() || "/account/wishlist";

  if (!sku) {
    redirect(appendQuery(returnTo, "error", "wishlist-invalid-sku"));
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;
  if (!token) {
    redirect("/login?error=wishlist-auth");
  }

  try {
    const userErrors = await addProductToWishlist(token, sku, quantity);
    if (userErrors.length > 0) {
      redirect(appendQuery(returnTo, "error", "wishlist-add-failed"));
    }
    redirect(appendQuery(returnTo, "wishlist", "added"));
  } catch (error: unknown) {
    if (error instanceof CommerceError) {
      redirect(appendQuery(returnTo, "error", "wishlist-add-failed"));
    }
    redirect(appendQuery(returnTo, "error", "wishlist-service-unavailable"));
  }
}
