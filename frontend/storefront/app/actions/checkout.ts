"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { getCheckoutReadiness, placeGuestOrder } from "@/src/lib/commerce/cart";

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function checkoutRedirect(params: Record<string, string>): never {
  const query = new URLSearchParams(params);
  redirect(`/cart?${query.toString()}`);
}

export async function placeOrderAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;

  if (!cartId) {
    checkoutRedirect({ checkout: "error", reason: "missing-cart" });
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const paymentMethodCode = String(formData.get("payment_method") ?? "").trim();

  if (!looksLikeEmail(email)) {
    checkoutRedirect({ checkout: "error", reason: "invalid-email" });
  }

  if (!paymentMethodCode) {
    checkoutRedirect({ checkout: "error", reason: "missing-payment-method" });
  }

  try {
    const readiness = await getCheckoutReadiness(cartId);
    const blockingReasons = readiness.reasons.filter(
      (reason) => reason !== "Guest email is required before placing order.",
    );

    if (blockingReasons.length > 0) {
      checkoutRedirect({ checkout: "error", reason: "cart-not-ready" });
    }

    const orderNumber = await placeGuestOrder(cartId, email, paymentMethodCode);
    cookieStore.delete("cart_id");
    checkoutRedirect({ checkout: "success", order: orderNumber });
  } catch (error: unknown) {
    if (error instanceof CommerceError) {
      checkoutRedirect({ checkout: "error", reason: "checkout-failed" });
    }
    checkoutRedirect({ checkout: "error", reason: "unexpected" });
  }
}
