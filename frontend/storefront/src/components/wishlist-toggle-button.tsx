"use client";

import { useState, type MouseEvent } from "react";

type WishlistToggleButtonProps = {
  sku: string;
  productName: string;
  initialInWishlist?: boolean;
};

type WishlistToggleResponse = {
  inWishlist?: boolean;
};

export function WishlistToggleButton({
  sku,
  productName,
  initialInWishlist = false
}: WishlistToggleButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(initialInWishlist);
  const [isPending, setIsPending] = useState(false);

  async function handleToggle(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) {
      return;
    }

    const previousState = isInWishlist;
    const desiredInWishlist = !previousState;
    setIsInWishlist(desiredInWishlist);
    setIsPending(true);

    try {
      const response = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sku,
          desiredInWishlist
        })
      });

      if (!response.ok) {
        setIsInWishlist(previousState);
        return;
      }

      const payload = (await response.json()) as WishlistToggleResponse;
      if (typeof payload.inWishlist === "boolean") {
        setIsInWishlist(payload.inWishlist);
      }
    } catch {
      setIsInWishlist(previousState);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={isInWishlist}
      aria-label={isInWishlist ? `Remove ${productName} from wish list` : `Add ${productName} to wish list`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/95 shadow-[0_6px_14px_rgba(19,32,47,0.12)] transition ${isInWishlist ? "text-ember" : "text-ink hover:bg-sand"} ${isPending ? "opacity-70" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={isInWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={isInWishlist ? "1.5" : "2"}
        aria-hidden="true"
      >
        <path d="M12 21s-6.5-4.1-9.1-7.5C.8 10.9 1.3 6.9 4.6 5.1c2.1-1.1 4.8-.5 6.4 1.4 1.6-1.9 4.3-2.5 6.4-1.4 3.3 1.8 3.8 5.8 1.7 8.4C18.5 16.9 12 21 12 21z" />
      </svg>
    </button>
  );
}
