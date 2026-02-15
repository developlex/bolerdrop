"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { addProductToWishlist, getCustomerWishlist, removeWishlistItem } from "@/src/lib/commerce/customer";
import { readCustomerTokenCookie } from "@/src/lib/session-cookies";

function appendQuery(path: string, key: string, value: string): string {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set(key, value);
  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

function isAlreadyInWishlistMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return normalized.includes("already") && normalized.includes("wish");
}

async function isProductInWishlist(token: string, sku: string): Promise<boolean> {
  try {
    const wishlist = await getCustomerWishlist(token, 100, 1);
    if (!wishlist) {
      return false;
    }
    const normalizedSku = sku.trim().toLowerCase();
    return wishlist.items.some((item) => (item.product?.sku ?? "").trim().toLowerCase() === normalizedSku);
  } catch {
    return false;
  }
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
  const token = readCustomerTokenCookie(cookieStore);
  if (!token) {
    redirect("/login?error=wishlist-auth");
  }

  const existedBefore = await isProductInWishlist(token, sku);

  try {
    const userErrors = await addProductToWishlist(token, sku, quantity);
    if (userErrors.length > 0) {
      if (userErrors.some((message) => isAlreadyInWishlistMessage(message))) {
        redirect(appendQuery(returnTo, "wishlist", "already"));
      }
      redirect(appendQuery(returnTo, "error", "wishlist-add-failed"));
    }
    redirect(appendQuery(returnTo, "wishlist", "added"));
  } catch (error: unknown) {
    const existsAfter = await isProductInWishlist(token, sku);
    if (existsAfter) {
      redirect(appendQuery(returnTo, "wishlist", existedBefore ? "already" : "added"));
    }
    if (error instanceof CommerceError) {
      redirect(appendQuery(returnTo, "error", "wishlist-add-failed"));
    }
    redirect(appendQuery(returnTo, "error", "wishlist-service-unavailable"));
  }
}

export async function removeFromWishlistBySkuAction(formData: FormData): Promise<void> {
  const sku = String(formData.get("sku") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "").trim() || "/account/wishlist";

  if (!sku) {
    redirect(appendQuery(returnTo, "error", "wishlist-invalid-sku"));
  }

  const cookieStore = await cookies();
  const token = readCustomerTokenCookie(cookieStore);
  if (!token) {
    redirect("/login?error=wishlist-auth");
  }

  try {
    const wishlist = await getCustomerWishlist(token, 100, 1);
    if (!wishlist) {
      redirect(appendQuery(returnTo, "error", "wishlist-remove-failed"));
    }

    const normalizedSku = sku.trim().toLowerCase();
    const existingItem = wishlist.items.find((item) => (item.product?.sku ?? "").trim().toLowerCase() === normalizedSku);

    if (!existingItem) {
      redirect(appendQuery(returnTo, "wishlist", "removed"));
    }

    const userErrors = await removeWishlistItem(token, wishlist.id, existingItem.id);
    if (userErrors.length > 0) {
      redirect(appendQuery(returnTo, "error", "wishlist-remove-failed"));
    }

    redirect(appendQuery(returnTo, "wishlist", "removed"));
  } catch (error: unknown) {
    if (error instanceof CommerceError) {
      redirect(appendQuery(returnTo, "error", "wishlist-remove-failed"));
    }
    redirect(appendQuery(returnTo, "error", "wishlist-service-unavailable"));
  }
}
