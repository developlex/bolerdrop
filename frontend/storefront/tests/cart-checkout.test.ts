import test from "node:test";
import assert from "node:assert/strict";
import { getCheckoutReadiness, placeGuestOrder, placeOrder } from "@/src/lib/commerce/cart";

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

test("getCheckoutReadiness reports blocking reasons for incomplete physical cart", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async () => jsonResponse({
    data: {
      cart: {
        id: "cart-1",
        email: null,
        is_virtual: false,
        available_payment_methods: [],
        shipping_addresses: []
      }
    }
  })) as typeof fetch;

  try {
    const readiness = await getCheckoutReadiness("cart-1");
    assert.equal(readiness.ready, false);
    assert.equal(readiness.isVirtual, false);
    assert.equal(readiness.requiresGuestEmail, true);
    assert.equal(readiness.availablePaymentMethods.length, 0);
    assert.ok(readiness.reasons.includes("Shipping method is not selected yet."));
    assert.ok(readiness.reasons.includes("No payment methods are currently available."));
    assert.ok(readiness.reasons.includes("Guest email is required before placing order."));
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("getCheckoutReadiness is ready for virtual cart with email and payment", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async () => jsonResponse({
    data: {
      cart: {
        id: "cart-virtual",
        email: "guest@example.test",
        is_virtual: true,
        available_payment_methods: [
          { code: "checkmo", title: "Check / Money order" }
        ],
        shipping_addresses: []
      }
    }
  })) as typeof fetch;

  try {
    const readiness = await getCheckoutReadiness("cart-virtual");
    assert.equal(readiness.ready, true);
    assert.equal(readiness.reasons.length, 0);
    assert.equal(readiness.availablePaymentMethods[0]?.code, "checkmo");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("placeGuestOrder sets email and payment then places order", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  const operationNames: string[] = [];

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};
    const query = body.query ?? "";

    if (query.includes("SetGuestEmailOnCart")) {
      operationNames.push("SetGuestEmailOnCart");
      assert.equal(body.variables?.email, "guest@example.test");
      return jsonResponse({
        data: {
          setGuestEmailOnCart: {
            cart: { id: "cart-1", email: "guest@example.test" }
          }
        }
      });
    }

    if (query.includes("SetPaymentMethodOnCart")) {
      operationNames.push("SetPaymentMethodOnCart");
      assert.equal(body.variables?.paymentMethodCode, "checkmo");
      return jsonResponse({
        data: {
          setPaymentMethodOnCart: {
            cart: { id: "cart-1" }
          }
        }
      });
    }

    if (query.includes("PlaceOrder")) {
      operationNames.push("PlaceOrder");
      return jsonResponse({
        data: {
          placeOrder: {
            orderV2: { number: "000123" }
          }
        }
      });
    }

    return jsonResponse({ data: {} });
  }) as typeof fetch;

  try {
    const orderNumber = await placeGuestOrder("cart-1", {
      email: "guest@example.test",
      paymentMethodCode: "checkmo",
      shippingAddress: null,
      shippingMethod: null
    });
    assert.equal(orderNumber, "000123");
    assert.deepEqual(operationNames, [
      "SetGuestEmailOnCart",
      "SetPaymentMethodOnCart",
      "PlaceOrder"
    ]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("placeGuestOrder applies shipping address and method for physical carts", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  const operationNames: string[] = [];

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};
    const query = body.query ?? "";

    if (query.includes("SetGuestEmailOnCart")) {
      operationNames.push("SetGuestEmailOnCart");
      return jsonResponse({
        data: {
          setGuestEmailOnCart: {
            cart: { id: "cart-1", email: "guest@example.test" }
          }
        }
      });
    }

    if (query.includes("SetShippingAddressesOnCart")) {
      operationNames.push("SetShippingAddressesOnCart");
      assert.equal(body.variables?.firstname, "Alex");
      assert.equal(body.variables?.countryCode, "US");
      return jsonResponse({
        data: {
          setShippingAddressesOnCart: {
            cart: { id: "cart-1" }
          }
        }
      });
    }

    if (query.includes("SetShippingMethodsOnCart")) {
      operationNames.push("SetShippingMethodsOnCart");
      assert.equal(body.variables?.carrierCode, "flatrate");
      assert.equal(body.variables?.methodCode, "flatrate");
      return jsonResponse({
        data: {
          setShippingMethodsOnCart: {
            cart: { id: "cart-1" }
          }
        }
      });
    }

    if (query.includes("SetPaymentMethodOnCart")) {
      operationNames.push("SetPaymentMethodOnCart");
      return jsonResponse({
        data: {
          setPaymentMethodOnCart: {
            cart: { id: "cart-1" }
          }
        }
      });
    }

    if (query.includes("PlaceOrder")) {
      operationNames.push("PlaceOrder");
      return jsonResponse({
        data: {
          placeOrder: {
            orderV2: { number: "000124" }
          }
        }
      });
    }

    return jsonResponse({ data: {} });
  }) as typeof fetch;

  try {
    const orderNumber = await placeGuestOrder("cart-1", {
      email: "guest@example.test",
      paymentMethodCode: "checkmo",
      shippingAddress: {
        firstname: "Alex",
        lastname: "Buyer",
        street: ["123 Main St"],
        city: "Austin",
        postcode: "78701",
        countryCode: "US",
        telephone: "5550001111",
        region: "TX"
      },
      shippingMethod: {
        carrierCode: "flatrate",
        methodCode: "flatrate"
      }
    });
    assert.equal(orderNumber, "000124");
    assert.deepEqual(operationNames, [
      "SetGuestEmailOnCart",
      "SetShippingAddressesOnCart",
      "SetShippingMethodsOnCart",
      "SetPaymentMethodOnCart",
      "PlaceOrder"
    ]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("placeOrder throws when order number is missing", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async () => jsonResponse({
    data: {
      placeOrder: {
        orderV2: null
      }
    }
  })) as typeof fetch;

  try {
    await assert.rejects(
      () => placeOrder("cart-1"),
      /did not return an order number/
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});
