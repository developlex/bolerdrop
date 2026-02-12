import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { placeOrderAction } from "@/app/actions/checkout";
import { getCart, getCheckoutReadiness } from "@/src/lib/commerce/cart";
import { getCountryRegions } from "@/src/lib/commerce/directory";
import { dedupeUsStateOptions, US_COUNTRY_CODE, US_COUNTRY_LABEL, US_STATE_OPTIONS } from "@/src/lib/forms/us-states";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Cart | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  checkout?: string | string[];
  reason?: string | string[];
  order?: string | string[];
};

type StateOption = {
  code: string;
  name: string;
};

function getFirstValue(input: string | string[] | undefined): string | null {
  if (Array.isArray(input)) {
    return input[0] ?? null;
  }
  return typeof input === "string" ? input : null;
}

function getCheckoutNotice(searchParams: SearchParams | undefined): { type: "success" | "error"; message: string } | null {
  if (!searchParams) {
    return null;
  }

  const checkout = getFirstValue(searchParams.checkout);
  const reason = getFirstValue(searchParams.reason);
  const order = getFirstValue(searchParams.order);

  if (checkout === "success") {
    if (order) {
      return { type: "success", message: `Order was placed successfully. Order number: ${order}` };
    }
    return { type: "success", message: "Order was placed successfully." };
  }

  if (checkout !== "error") {
    return null;
  }

  const byReason: Record<string, string> = {
    "missing-cart": "Cart session was not found. Add products before checkout.",
    "invalid-email": "Enter a valid email address before placing order.",
    "invalid-shipping-address": "Shipping address is required for physical products.",
    "missing-shipping-method": "Select a shipping method before placing order.",
    "invalid-shipping-method": "Selected shipping method is not available for this cart.",
    "missing-payment-method": "Select a payment method before placing order.",
    "cart-not-ready": "Cart is not ready for checkout yet. Resolve shipping/payment readiness first.",
    "checkout-failed": "Checkout failed in commerce backend. Review cart readiness and try again.",
    unexpected: "Unexpected checkout failure occurred. Please try again."
  };

  return { type: "error", message: byReason[reason ?? ""] ?? "Checkout failed. Please try again." };
}

export default async function CartPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const checkoutNotice = getCheckoutNotice(resolvedSearchParams);
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;

  if (!cartId) {
    return (
      <section>
        <h1 className={ui.text.pageTitle}>Cart</h1>
        {checkoutNotice ? (
          <p className={(checkoutNotice.type === "error" ? ui.state.warning : ui.state.success) + " mt-4"}>
            {checkoutNotice.message}
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
  let readiness = null;
  const storeRegions = await getCountryRegions(US_COUNTRY_CODE).catch(() => []);
  const stateOptions: StateOption[] = dedupeUsStateOptions(storeRegions.length > 0
    ? storeRegions.map((region) => ({ code: region.code, name: region.name }))
    : [...US_STATE_OPTIONS]);
  try {
    cart = await getCart(cartId);
    readiness = await getCheckoutReadiness(cartId);
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
      {checkoutNotice ? (
        <p className={(checkoutNotice.type === "error" ? ui.state.warning : ui.state.success) + " mt-4"}>
          {checkoutNotice.message}
        </p>
      ) : null}
      <p className={ui.text.subtitle + " mt-2"}>Items: {cart.totalQuantity}</p>
      <div className="mt-6 space-y-3">
        {cart.items.map((item) => (
          <article key={item.uid} className={ui.surface.panel}>
            <h2 className={ui.text.value}>{item.name}</h2>
            <p className={ui.text.subtitle}>SKU: {item.sku}</p>
            <p className={ui.text.subtitle}>Qty: {item.quantity}</p>
            <p className={ui.text.body + " text-sm"}>
              {item.lineTotal !== null && item.currency ? `${item.currency} ${item.lineTotal.toFixed(2)}` : "Line total unavailable"}
            </p>
          </article>
        ))}
      </div>
      <div className={ui.surface.panel + " mt-6"}>
        <p className={ui.text.value}>
          Grand total: {cart.grandTotal !== null && cart.currency ? `${cart.currency} ${cart.grandTotal.toFixed(2)}` : "Unavailable"}
        </p>

        {readiness ? (
          <div className="mt-4 space-y-3">
            <p className={ui.text.subtitle}>
              Shipping selected: {readiness.isVirtual ? "Not required (virtual cart)" : readiness.selectedShippingMethod ? readiness.selectedShippingMethod : "No"}
            </p>
            <p className={ui.text.subtitle}>
              Payment methods available: {readiness.availablePaymentMethods.length}
            </p>

            {readiness.availableShippingMethods.length > 0 ? (
              <div>
                <p className={ui.text.label}>Available shipping methods:</p>
                <ul className="mt-1 space-y-1">
                  {readiness.availableShippingMethods.map((method) => (
                    <li key={`${method.carrierCode}:${method.methodCode}`} className={ui.text.subtitle}>
                      {method.carrierTitle ?? method.carrierCode} - {method.methodTitle ?? method.methodCode}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {readiness.reasons.length > 0 ? (
              <div className={ui.state.warning}>
                <p className="font-medium">Checkout is blocked:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {readiness.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <form action={placeOrderAction} className="space-y-3">
              <label className="block text-sm">
                <span className={ui.text.label + " mb-1 block"}>Guest email *</span>
                <input name="email" type="email" required className={ui.form.input} placeholder="name@example.com" />
              </label>
              {!readiness.isVirtual ? (
                <div className="space-y-3">
                  <p className={ui.text.label}>Shipping address</p>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>First name *</span>
                    <input name="shipping_firstname" type="text" required className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Last name *</span>
                    <input name="shipping_lastname" type="text" required className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Street line 1 *</span>
                    <input name="shipping_street_1" type="text" required className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Street line 2 (optional)</span>
                    <input name="shipping_street_2" type="text" className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>City *</span>
                    <input name="shipping_city" type="text" required className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>State *</span>
                    <select name="shipping_state" required defaultValue="" className={ui.form.select}>
                      <option value="" disabled>Select state</option>
                      {stateOptions.map((state) => (
                        <option key={`${state.code}-${state.name}`} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>ZIP Code *</span>
                    <input name="shipping_postcode" type="text" required className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Country *</span>
                    <select name="shipping_country_code" required defaultValue={US_COUNTRY_CODE} className={ui.form.select}>
                      <option value={US_COUNTRY_CODE}>{US_COUNTRY_LABEL}</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Telephone *</span>
                    <input name="shipping_telephone" type="tel" required className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Shipping method *</span>
                    <select
                      name="shipping_method"
                      className={ui.form.select}
                      defaultValue={
                        readiness.selectedShippingMethod ??
                        (readiness.availableShippingMethods[0]
                          ? `${readiness.availableShippingMethods[0].carrierCode}:${readiness.availableShippingMethods[0].methodCode}`
                          : "")
                      }
                    >
                      {readiness.availableShippingMethods.map((method) => (
                        <option key={`${method.carrierCode}:${method.methodCode}`} value={`${method.carrierCode}:${method.methodCode}`}>
                          {method.carrierTitle ?? method.carrierCode} - {method.methodTitle ?? method.methodCode}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
              <label className="block text-sm">
                <span className={ui.text.label + " mb-1 block"}>Payment method *</span>
                <select name="payment_method" className={ui.form.select} defaultValue={readiness.availablePaymentMethods[0]?.code ?? ""}>
                  {readiness.availablePaymentMethods.map((method) => (
                    <option key={method.code} value={method.code}>
                      {method.title || method.code}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={readiness.availablePaymentMethods.length === 0}
                className={`${ui.action.buttonPrimary} ${readiness.availablePaymentMethods.length === 0 ? "cursor-not-allowed opacity-60" : ""}`}
              >
                Place order
              </button>
            </form>
          </div>
        ) : (
          <p className={ui.text.subtitle + " mt-2"}>Checkout readiness data is unavailable.</p>
        )}
      </div>
    </section>
  );
}
