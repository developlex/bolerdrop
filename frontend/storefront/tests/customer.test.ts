import test from "node:test";
import assert from "node:assert/strict";
import {
  addProductToWishlist,
  createCustomerAccount,
  createCustomerAddress,
  generateCustomerToken,
  getCustomerDashboard,
  updateCustomerAddress
} from "@/src/lib/commerce/customer";

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

test("createCustomerAccount sends registration payload and maps customer response", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};
    assert.ok(body.query?.includes("CreateCustomer"));
    assert.equal(body.variables?.firstname, "Alex");
    assert.equal(body.variables?.lastname, "Buyer");
    assert.equal(body.variables?.email, "alex@example.test");

    return jsonResponse({
      data: {
        createCustomer: {
          customer: {
            email: "alex@example.test",
            firstname: "Alex",
            lastname: "Buyer"
          }
        }
      }
    });
  }) as typeof fetch;

  try {
    const customer = await createCustomerAccount({
      firstname: "Alex",
      lastname: "Buyer",
      email: "alex@example.test",
      password: "StrongPass123!"
    });
    assert.equal(customer.email, "alex@example.test");
    assert.equal(customer.firstname, "Alex");
    assert.equal(customer.lastname, "Buyer");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("generateCustomerToken returns auth token", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};
    assert.ok(body.query?.includes("GenerateCustomerToken"));
    assert.equal(body.variables?.email, "alex@example.test");
    return jsonResponse({
      data: {
        generateCustomerToken: {
          token: "customer-token-123"
        }
      }
    });
  }) as typeof fetch;

  try {
    const token = await generateCustomerToken("alex@example.test", "StrongPass123!");
    assert.equal(token, "customer-token-123");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("getCustomerDashboard maps account sections", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};
    assert.ok(body.query?.includes("GetCustomerDashboard"));
    return jsonResponse({
      data: {
        customer: {
          email: "alex@example.test",
          firstname: "Alex",
          lastname: "Buyer",
          is_subscribed: true,
          default_billing: "10",
          default_shipping: "11",
          addresses: [
            {
              id: 10,
              firstname: "Alex",
              lastname: "Buyer",
              street: ["123 Test St"],
              city: "Austin",
              postcode: "78701",
              country_code: "US",
              telephone: "5550001",
              default_billing: true,
              default_shipping: false,
              region: {
                region: "Texas",
                region_code: "TX"
              }
            }
          ],
          orders: {
            total_count: 1,
            items: [
              {
                number: "000000123",
                order_date: "2026-02-12 01:00:00",
                status: "processing",
                total: {
                  grand_total: {
                    value: 99.5,
                    currency: "USD"
                  }
                }
              }
            ]
          },
          wishlists: [
            {
              id: 3,
              items_count: 2,
              updated_at: "2026-02-12 01:10:00"
            }
          ]
        }
      }
    });
  }) as typeof fetch;

  try {
    const dashboard = await getCustomerDashboard("customer-token-123");
    assert.equal(dashboard.profile.email, "alex@example.test");
    assert.equal(dashboard.isSubscribed, true);
    assert.equal(dashboard.defaultBillingId, "10");
    assert.equal(dashboard.defaultShippingId, "11");
    assert.equal(dashboard.addresses.length, 1);
    assert.equal(dashboard.orders.length, 1);
    assert.equal(dashboard.orders[0]?.number, "000000123");
    assert.equal(dashboard.wishlists[0]?.itemsCount, 2);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("addProductToWishlist uses primary wishlist id and sku input", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};

    if (body.query?.includes("GetCustomerDashboard")) {
      return jsonResponse({
        data: {
          customer: {
            email: "alex@example.test",
            firstname: "Alex",
            lastname: "Buyer",
            is_subscribed: false,
            default_billing: null,
            default_shipping: null,
            addresses: [],
            orders: {
              total_count: 0,
              items: []
            },
            wishlists: [
              {
                id: 7,
                items_count: 0,
                updated_at: "2026-02-12 01:10:00"
              }
            ]
          }
        }
      });
    }

    assert.ok(body.query?.includes("AddProductsToWishlist"));
    assert.equal(body.variables?.wishlistId, "7");
    assert.deepEqual(body.variables?.wishlistItems, [{ sku: "SKU-1", quantity: 2 }]);
    return jsonResponse({
      data: {
        addProductsToWishlist: {
          user_errors: []
        }
      }
    });
  }) as typeof fetch;

  try {
    const errors = await addProductToWishlist("customer-token", "SKU-1", 2);
    assert.deepEqual(errors, []);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("addProductToWishlist returns unavailable when wishlist missing", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};
    assert.ok(body.query?.includes("GetCustomerDashboard"));
    return jsonResponse({
      data: {
        customer: {
          email: "alex@example.test",
          firstname: "Alex",
          lastname: "Buyer",
          is_subscribed: false,
          default_billing: null,
          default_shipping: null,
          addresses: [],
          orders: {
            total_count: 0,
            items: []
          },
          wishlists: []
        }
      }
    });
  }) as typeof fetch;

  try {
    const errors = await addProductToWishlist("customer-token", "SKU-1", 1);
    assert.deepEqual(errors, ["Wishlist unavailable."]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("createCustomerAddress omits empty region from mutation input", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};
    assert.ok(body.query?.includes("CreateCustomerAddress"));
    const input = body.variables?.input as Record<string, unknown>;
    assert.equal(input.firstname, "Alex");
    assert.equal(input.country_code, "US");
    assert.equal("region" in input, false);
    return jsonResponse({
      data: {
        createCustomerAddress: {
          id: 12
        }
      }
    });
  }) as typeof fetch;

  try {
    const id = await createCustomerAddress("customer-token", {
      firstname: "Alex",
      lastname: "Buyer",
      street: ["123 Test St"],
      city: "Austin",
      postcode: "78701",
      countryCode: "US",
      telephone: "5550001",
      region: "   ",
      defaultShipping: false,
      defaultBilling: true
    });
    assert.equal(id, "12");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("updateCustomerAddress maps region into nested mutation input object", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";
  let countriesLookupCalls = 0;

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as {
      query?: string;
      variables?: Record<string, unknown>;
    } : {};

    if (body.query?.includes("GetCountries")) {
      countriesLookupCalls += 1;
      return jsonResponse({
        data: {
          countries: [
            {
              id: "US",
              two_letter_abbreviation: "US",
              available_regions: [
                { id: 57, code: "TX", name: "Texas" }
              ]
            }
          ]
        }
      });
    }

    assert.ok(body.query?.includes("UpdateCustomerAddress"));
    assert.equal(body.variables?.addressId, 24);
    const input = body.variables?.input as Record<string, unknown>;
    assert.deepEqual(input.region, { region: "Texas", region_id: 57, region_code: "TX" });
    return jsonResponse({
      data: {
        updateCustomerAddress: {
          id: 24
        }
      }
    });
  }) as typeof fetch;

  try {
    const id = await updateCustomerAddress("customer-token", 24, {
      firstname: "Alex",
      lastname: "Buyer",
      street: ["123 Test St"],
      city: "Austin",
      postcode: "78701",
      countryCode: "US",
      telephone: "5550001",
      region: "Texas",
      defaultShipping: true,
      defaultBilling: false
    });
    assert.equal(id, "24");
    assert.equal(countriesLookupCalls, 1);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});
