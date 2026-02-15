import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CommerceError } from "@/src/lib/commerce/client";
import { addProductToWishlist, getCustomerWishlist, removeWishlistItem } from "@/src/lib/commerce/customer";

type ToggleWishlistRequest = {
  sku?: string;
  desiredInWishlist?: boolean;
};

function isAlreadyInWishlistMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return normalized.includes("already") && normalized.includes("wish");
}

function normalizeSku(value: string): string {
  return value.trim().toLowerCase();
}

async function isProductInWishlist(token: string, sku: string): Promise<boolean> {
  try {
    const wishlist = await getCustomerWishlist(token, 100, 1);
    if (!wishlist) {
      return false;
    }
    const normalizedSku = normalizeSku(sku);
    return wishlist.items.some((item) => normalizeSku(item.product?.sku ?? "") === normalizedSku);
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as ToggleWishlistRequest | null;
  const sku = typeof body?.sku === "string" ? body.sku.trim() : "";
  const desiredInWishlist = Boolean(body?.desiredInWishlist);

  if (!sku) {
    return NextResponse.json(
      { error: "wishlist-invalid-sku" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "wishlist-auth", inWishlist: false },
      { status: 401 }
    );
  }

  try {
    const wishlist = await getCustomerWishlist(token, 100, 1);
    const normalizedSku = normalizeSku(sku);
    const existingItem = wishlist?.items.find(
      (item) => normalizeSku(item.product?.sku ?? "") === normalizedSku
    );

    if (desiredInWishlist) {
      if (existingItem) {
        return NextResponse.json({ inWishlist: true, status: "already" });
      }

      const existedBefore = false;
      const userErrors = await addProductToWishlist(token, sku, 1);
      if (userErrors.length > 0) {
        if (userErrors.some((message) => isAlreadyInWishlistMessage(message))) {
          return NextResponse.json({ inWishlist: true, status: "already" });
        }
        const existsAfter = await isProductInWishlist(token, sku);
        if (existsAfter) {
          return NextResponse.json({ inWishlist: existedBefore ? true : true, status: "added" });
        }
        return NextResponse.json({ error: "wishlist-add-failed", inWishlist: false }, { status: 502 });
      }

      return NextResponse.json({ inWishlist: true, status: "added" });
    }

    if (!wishlist || !existingItem) {
      return NextResponse.json({ inWishlist: false, status: "removed" });
    }

    const userErrors = await removeWishlistItem(token, wishlist.id, existingItem.id);
    if (userErrors.length > 0) {
      const existsAfter = await isProductInWishlist(token, sku);
      if (!existsAfter) {
        return NextResponse.json({ inWishlist: false, status: "removed" });
      }
      return NextResponse.json({ error: "wishlist-remove-failed", inWishlist: true }, { status: 502 });
    }

    return NextResponse.json({ inWishlist: false, status: "removed" });
  } catch (error: unknown) {
    const existsAfter = await isProductInWishlist(token, sku);
    if (desiredInWishlist && existsAfter) {
      return NextResponse.json({ inWishlist: true, status: "added" });
    }
    if (!desiredInWishlist && !existsAfter) {
      return NextResponse.json({ inWishlist: false, status: "removed" });
    }
    if (error instanceof CommerceError) {
      return NextResponse.json(
        { error: "wishlist-service-unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "wishlist-service-unavailable" },
      { status: 503 }
    );
  }
}
