import { commerceGraphQL } from "@/src/lib/commerce/client";
import { mapCart } from "@/src/lib/commerce/mappers";
import {
  ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION,
  CREATE_EMPTY_CART_MUTATION,
  GET_CART_CHECKOUT_READINESS_QUERY,
  GET_CART_QUERY,
  PLACE_ORDER_MUTATION,
  SET_BILLING_ADDRESS_FROM_CUSTOMER_ADDRESS_MUTATION,
  REMOVE_ITEM_FROM_CART_MUTATION,
  SET_GUEST_EMAIL_ON_CART_MUTATION,
  SET_SHIPPING_ADDRESS_FROM_CUSTOMER_ADDRESS_MUTATION,
  SET_PAYMENT_METHOD_ON_CART_MUTATION,
  SET_SHIPPING_ADDRESSES_ON_CART_MUTATION,
  SET_SHIPPING_METHODS_ON_CART_MUTATION,
  UPDATE_CART_ITEMS_MUTATION
} from "@/src/lib/commerce/queries";
import type {
  CartSnapshot,
  CheckoutReadiness,
  MagentoCartNode,
  PlaceGuestOrderInput,
  PaymentMethodOption,
  ShippingAddressInput,
  ShippingMethodInput,
  ShippingMethodOption
} from "@/src/lib/commerce/types";

type CreateEmptyCartResponse = {
  createEmptyCart: string;
};

type AddSimpleProductsResponse = {
  addSimpleProductsToCart: {
    cart: MagentoCartNode;
  };
};

type UpdateCartItemsResponse = {
  updateCartItems: {
    cart: MagentoCartNode;
  };
};

type RemoveItemFromCartResponse = {
  removeItemFromCart: {
    cart: MagentoCartNode;
  };
};

type GetCartResponse = {
  cart: MagentoCartNode;
};

type SetGuestEmailResponse = {
  setGuestEmailOnCart: {
    cart: {
      id: string;
      email?: string | null;
    };
  };
};

type SetPaymentMethodResponse = {
  setPaymentMethodOnCart: {
    cart: {
      id: string;
    };
  };
};

type SetShippingAddressesResponse = {
  setShippingAddressesOnCart: {
    cart: {
      id: string;
    };
  };
};

type SetBillingAddressResponse = {
  setBillingAddressOnCart: {
    cart: {
      id: string;
    };
  };
};

type SetShippingMethodsResponse = {
  setShippingMethodsOnCart: {
    cart: {
      id: string;
    };
  };
};

type PlaceOrderResponse = {
  placeOrder: {
    orderV2?: {
      number?: string | null;
    } | null;
  };
};

export async function createEmptyCart(): Promise<string> {
  const data = await commerceGraphQL<CreateEmptyCartResponse>(CREATE_EMPTY_CART_MUTATION);
  return data.createEmptyCart;
}

export async function addSimpleSkuToCart(cartId: string, sku: string, quantity: number): Promise<CartSnapshot> {
  const data = await commerceGraphQL<AddSimpleProductsResponse>(ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION, {
    cartId,
    sku,
    quantity
  });
  return mapCart(data.addSimpleProductsToCart.cart);
}

export async function updateCartItemQuantity(cartId: string, cartItemUid: string, quantity: number): Promise<CartSnapshot> {
  const data = await commerceGraphQL<UpdateCartItemsResponse>(UPDATE_CART_ITEMS_MUTATION, {
    cartId,
    cartItemUid,
    quantity
  });
  return mapCart(data.updateCartItems.cart);
}

export async function removeCartItem(cartId: string, cartItemUid: string): Promise<CartSnapshot> {
  const data = await commerceGraphQL<RemoveItemFromCartResponse>(REMOVE_ITEM_FROM_CART_MUTATION, {
    cartId,
    cartItemUid
  });
  return mapCart(data.removeItemFromCart.cart);
}

export async function getCart(cartId: string): Promise<CartSnapshot> {
  const data = await commerceGraphQL<GetCartResponse>(GET_CART_QUERY, { cartId });
  return mapCart(data.cart);
}

function mapPaymentMethods(raw: MagentoCartNode): PaymentMethodOption[] {
  if (!Array.isArray(raw.available_payment_methods)) {
    return [];
  }

  return raw.available_payment_methods
    .map((method) => ({
      code: String(method?.code ?? "").trim(),
      title: String(method?.title ?? "").trim()
    }))
    .filter((method) => method.code.length > 0);
}

function mapShippingMethods(raw: MagentoCartNode): ShippingMethodOption[] {
  const address = Array.isArray(raw.shipping_addresses) ? raw.shipping_addresses[0] : undefined;
  const methods = address?.available_shipping_methods;

  if (!Array.isArray(methods)) {
    return [];
  }

  return methods
    .map((method) => ({
      carrierCode: String(method?.carrier_code ?? "").trim(),
      methodCode: String(method?.method_code ?? "").trim(),
      carrierTitle: typeof method?.carrier_title === "string" ? method.carrier_title : null,
      methodTitle: typeof method?.method_title === "string" ? method.method_title : null,
      amount: typeof method?.amount?.value === "number" ? method.amount.value : null,
      currency: typeof method?.amount?.currency === "string" ? method.amount.currency : null
    }))
    .filter((method) => method.carrierCode.length > 0 && method.methodCode.length > 0);
}

function getSelectedShippingMethod(raw: MagentoCartNode): string | null {
  const address = Array.isArray(raw.shipping_addresses) ? raw.shipping_addresses[0] : undefined;
  const selected = address?.selected_shipping_method;

  if (!selected?.carrier_code || !selected?.method_code) {
    return null;
  }

  return `${selected.carrier_code}:${selected.method_code}`;
}

export async function getCheckoutReadiness(cartId: string): Promise<CheckoutReadiness> {
  const data = await commerceGraphQL<GetCartResponse>(GET_CART_CHECKOUT_READINESS_QUERY, { cartId });
  const cart = data.cart;

  const isVirtual = cart.is_virtual === true;
  const hasGuestEmail = typeof cart.email === "string" && cart.email.trim().length > 0;
  const paymentMethods = mapPaymentMethods(cart);
  const shippingMethods = mapShippingMethods(cart);
  const selectedShippingMethod = getSelectedShippingMethod(cart);

  const reasons: string[] = [];
  if (!isVirtual && !selectedShippingMethod) {
    reasons.push("Shipping method is not selected yet.");
  }
  if (!isVirtual && shippingMethods.length === 0) {
    reasons.push("No shipping methods are currently available.");
  }
  if (paymentMethods.length === 0) {
    reasons.push("No payment methods are currently available.");
  }
  if (!hasGuestEmail) {
    reasons.push("Guest email is required before placing order.");
  }

  return {
    ready: reasons.length === 0,
    reasons,
    isVirtual,
    requiresGuestEmail: !hasGuestEmail,
    selectedShippingMethod,
    availablePaymentMethods: paymentMethods,
    availableShippingMethods: shippingMethods
  };
}

export async function setGuestEmailOnCart(cartId: string, email: string): Promise<void> {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    return;
  }

  await commerceGraphQL<SetGuestEmailResponse>(SET_GUEST_EMAIL_ON_CART_MUTATION, {
    cartId,
    email: normalizedEmail
  });
}

export async function setPaymentMethodOnCart(cartId: string, paymentMethodCode: string): Promise<void> {
  await commerceGraphQL<SetPaymentMethodResponse>(SET_PAYMENT_METHOD_ON_CART_MUTATION, {
    cartId,
    paymentMethodCode
  });
}

export async function setShippingAddressOnCart(cartId: string, shippingAddress: ShippingAddressInput): Promise<void> {
  await commerceGraphQL<SetShippingAddressesResponse>(SET_SHIPPING_ADDRESSES_ON_CART_MUTATION, {
    cartId,
    firstname: shippingAddress.firstname,
    lastname: shippingAddress.lastname,
    street: shippingAddress.street,
    city: shippingAddress.city,
    postcode: shippingAddress.postcode,
    countryCode: shippingAddress.countryCode,
    telephone: shippingAddress.telephone,
    region: shippingAddress.region
  });
}

export async function setShippingAddressFromCustomerAddressOnCart(cartId: string, customerAddressId: number): Promise<void> {
  await commerceGraphQL<SetShippingAddressesResponse>(SET_SHIPPING_ADDRESS_FROM_CUSTOMER_ADDRESS_MUTATION, {
    cartId,
    customerAddressId
  });
}

export async function setBillingAddressFromCustomerAddressOnCart(cartId: string, customerAddressId: number): Promise<void> {
  await commerceGraphQL<SetBillingAddressResponse>(SET_BILLING_ADDRESS_FROM_CUSTOMER_ADDRESS_MUTATION, {
    cartId,
    customerAddressId
  });
}

export async function setShippingMethodOnCart(cartId: string, shippingMethod: ShippingMethodInput): Promise<void> {
  await commerceGraphQL<SetShippingMethodsResponse>(SET_SHIPPING_METHODS_ON_CART_MUTATION, {
    cartId,
    carrierCode: shippingMethod.carrierCode,
    methodCode: shippingMethod.methodCode
  });
}

export async function placeOrder(cartId: string): Promise<string> {
  const data = await commerceGraphQL<PlaceOrderResponse>(PLACE_ORDER_MUTATION, { cartId });
  const orderNumber = data.placeOrder.orderV2?.number;
  if (!orderNumber) {
    throw new Error("placeOrder did not return an order number");
  }
  return orderNumber;
}

export async function placeGuestOrder(cartId: string, input: PlaceGuestOrderInput): Promise<string> {
  await setGuestEmailOnCart(cartId, input.email);

  if (input.shippingAddress) {
    await setShippingAddressOnCart(cartId, input.shippingAddress);
  }

  if (input.shippingMethod) {
    await setShippingMethodOnCart(cartId, input.shippingMethod);
  }

  await setPaymentMethodOnCart(cartId, input.paymentMethodCode);
  return placeOrder(cartId);
}
