"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const WISHLIST_ERROR_CODES = new Set([
  "wishlist-auth",
  "wishlist-invalid-sku",
  "wishlist-add-failed",
  "wishlist-service-unavailable"
]);

export function WishlistFlashCleaner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const wishlist = searchParams.get("wishlist");
    const error = searchParams.get("error");
    const hasWishlistFlash = wishlist === "added" || wishlist === "already";
    const hasWishlistError = error !== null && WISHLIST_ERROR_CODES.has(error);

    if (!hasWishlistFlash && !hasWishlistError) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("wishlist");
    params.delete("error");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
