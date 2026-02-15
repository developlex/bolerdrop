"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { US_COUNTRY_CODE } from "@/src/lib/forms/us-states";
import { getCheckoutReadiness, placeGuestOrder, setShippingAddressOnCart, setShippingMethodOnCart } from "@/src/lib/commerce/cart";
import { getCustomerDashboard, getCustomerProfile } from "@/src/lib/commerce/customer";
import type { CustomerAddress, PlaceGuestOrderInput, ShippingAddressInput, ShippingMethodInput } from "@/src/lib/commerce/types";

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function checkoutRedirect(params: Record<string, string>): never {
  const query = new URLSearchParams(params);
  redirect(`/checkout?${query.toString()}`);
}

function confirmationRedirect(orderNumber: string): never {
  const query = new URLSearchParams({ order: orderNumber });
  redirect(`/order/confirmation?${query.toString()}`);
}

function getRequiredField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseShippingMethod(input: string): ShippingMethodInput | null {
  const normalized = input.trim();
  if (!normalized) {
    return null;
  }

  const [carrierCode, methodCode] = normalized.split(":", 2).map((part) => part.trim());
  if (!carrierCode || !methodCode) {
    return null;
  }

  return { carrierCode, methodCode };
}

function parseAddressId(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolveDefaultShippingAddress(addresses: CustomerAddress[], defaultShippingId: string | null): CustomerAddress | null {
  const parsedDefaultId = parseAddressId(defaultShippingId);
  if (parsedDefaultId !== null) {
    const byId = addresses.find((address) => Number(address.id) === parsedDefaultId);
    if (byId) {
      return byId;
    }
  }
  return addresses.find((address) => address.defaultShipping) ?? null;
}

function toShippingAddressInput(address: CustomerAddress): ShippingAddressInput {
  const street = address.street.filter((line) => line.trim().length > 0);
  return {
    firstname: address.firstname,
    lastname: address.lastname,
    street: street.length > 0 ? street : [""],
    city: address.city,
    postcode: address.postcode,
    countryCode: address.countryCode,
    telephone: address.telephone,
    region: address.regionCode ?? address.region
  };
}

function readShippingAddress(formData: FormData): ShippingAddressInput | null {
  const firstname = getRequiredField(formData, "shipping_firstname");
  const lastname = getRequiredField(formData, "shipping_lastname");
  const street1 = getRequiredField(formData, "shipping_street_1");
  const street2 = getRequiredField(formData, "shipping_street_2");
  const city = getRequiredField(formData, "shipping_city");
  const postcode = getRequiredField(formData, "shipping_postcode");
  const countryCode = getRequiredField(formData, "shipping_country_code").toUpperCase();
  const telephone = getRequiredField(formData, "shipping_telephone");
  const stateRaw = String(formData.get("shipping_state") ?? formData.get("shipping_region") ?? "").trim().toUpperCase();

  if (!firstname || !lastname || !street1 || !city || !postcode || !countryCode || !telephone || !stateRaw) {
    return null;
  }
  if (countryCode !== US_COUNTRY_CODE) {
    return null;
  }

  const street = street2 ? [street1, street2] : [street1];
  return {
    firstname,
    lastname,
    street,
    city,
    postcode,
    countryCode,
    telephone,
    region: stateRaw
  };
}

function resolveShippingMethod(
  requested: ShippingMethodInput | null,
  selectedMethod: string | null,
  availableMethods: ReadonlyArray<ShippingMethodInput>,
): ShippingMethodInput | null {
  if (requested) {
    return requested;
  }

  if (selectedMethod) {
    return parseShippingMethod(selectedMethod);
  }

  const firstAvailable = availableMethods[0];
  if (!firstAvailable) {
    return null;
  }

  return {
    carrierCode: firstAvailable.carrierCode,
    methodCode: firstAvailable.methodCode
  };
}

function shippingMethodExists(
  shippingMethod: ShippingMethodInput,
  availableMethods: ReadonlyArray<ShippingMethodInput>,
): boolean {
  return availableMethods.some(
    (method) => method.carrierCode === shippingMethod.carrierCode && method.methodCode === shippingMethod.methodCode,
  );
}

export async function placeOrderAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;
  const customerToken = cookieStore.get("customer_token")?.value;

  if (!cartId) {
    checkoutRedirect({ checkout: "error", reason: "missing-cart" });
  }

  let email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (customerToken) {
    try {
      const customerProfile = await getCustomerProfile(customerToken);
      const profileEmail = customerProfile.email.trim().toLowerCase();
      if (profileEmail) {
        email = profileEmail;
      }
    } catch {
      // Fall back to submitted email if customer session is stale.
    }
  }
  const paymentMethodCode = String(formData.get("payment_method") ?? "").trim();

  if (!looksLikeEmail(email)) {
    checkoutRedirect({ checkout: "error", reason: "invalid-email" });
  }

  if (!paymentMethodCode) {
    checkoutRedirect({ checkout: "error", reason: "missing-payment-method" });
  }

  try {
    let shippingMethod: ShippingMethodInput | null = null;
    const readiness = await getCheckoutReadiness(cartId);
    let readinessForGate = readiness;

    if (!readiness.isVirtual) {
      const shippingAddressFromForm = readShippingAddress(formData);
      let addressApplied = false;
      if (shippingAddressFromForm) {
        await setShippingAddressOnCart(cartId, shippingAddressFromForm);
        addressApplied = true;
      } else if (customerToken) {
        try {
          const dashboard = await getCustomerDashboard(customerToken);
          const defaultShippingAddress = resolveDefaultShippingAddress(dashboard.addresses, dashboard.defaultShippingId);
          if (defaultShippingAddress) {
            await setShippingAddressOnCart(cartId, toShippingAddressInput(defaultShippingAddress));
            addressApplied = true;
          }
        } catch {
          addressApplied = false;
        }
      }

      if (!addressApplied) {
        checkoutRedirect({ checkout: "error", reason: "invalid-shipping-address" });
      }

      const readinessAfterAddress = await getCheckoutReadiness(cartId);

      const requestedShippingMethod = parseShippingMethod(String(formData.get("shipping_method") ?? ""));
      shippingMethod = resolveShippingMethod(
        requestedShippingMethod,
        readinessAfterAddress.selectedShippingMethod,
        readinessAfterAddress.availableShippingMethods,
      );

      if (!shippingMethod) {
        checkoutRedirect({ checkout: "error", reason: "missing-shipping-method" });
      }

      if (
        readinessAfterAddress.availableShippingMethods.length > 0 &&
        !shippingMethodExists(shippingMethod, readinessAfterAddress.availableShippingMethods)
      ) {
        checkoutRedirect({ checkout: "error", reason: "invalid-shipping-method" });
      }

      if (requestedShippingMethod || !readinessAfterAddress.selectedShippingMethod) {
        await setShippingMethodOnCart(cartId, shippingMethod);
      }
      readinessForGate = await getCheckoutReadiness(cartId);
    }

    const ignoredReasons = new Set<string>(["Guest email is required before placing order."]);
    if (shippingMethod) {
      ignoredReasons.add("Shipping method is not selected yet.");
    }
    const blockingReasons = readinessForGate.reasons.filter((reason) => !ignoredReasons.has(reason));

    if (blockingReasons.length > 0) {
      checkoutRedirect({ checkout: "error", reason: "cart-not-ready" });
    }

    const placeOrderInput: PlaceGuestOrderInput = {
      email,
      paymentMethodCode,
      shippingAddress: null,
      shippingMethod
    };

    const orderNumber = await placeGuestOrder(cartId, placeOrderInput);
    cookieStore.delete("cart_id");
    confirmationRedirect(orderNumber);
  } catch (error: unknown) {
    if (error instanceof CommerceError) {
      checkoutRedirect({ checkout: "error", reason: "checkout-failed" });
    }
    checkoutRedirect({ checkout: "error", reason: "unexpected" });
  }
}
