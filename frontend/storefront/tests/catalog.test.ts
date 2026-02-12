import test from "node:test";
import assert from "node:assert/strict";
import { getCatalogPage, getProductByUrlKey } from "@/src/lib/commerce/catalog";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" }
  });
}

test("getCatalogPage maps products and pagination metadata", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const requestBody = typeof init?.body === "string" ? JSON.parse(init.body) as {
      variables?: { pageSize?: number; currentPage?: number; search?: string };
    } : {};
    assert.equal(requestBody.variables?.pageSize, 12);
    assert.equal(requestBody.variables?.currentPage, 2);
    assert.equal(requestBody.variables?.search, "");

    return jsonResponse({
      data: {
        products: {
          items: [
            {
              uid: "uid-1",
              sku: "SKU-1",
              name: "First Product",
              url_key: "first-product",
              small_image: { url: "http://image.test/1.jpg" },
              price_range: {
                minimum_price: {
                  final_price: { value: 10, currency: "USD" }
                }
              }
            }
          ],
          total_count: 25,
          page_info: { current_page: 2, total_pages: 3 }
        }
      }
    });
  }) as typeof fetch;

  try {
    const catalog = await getCatalogPage(12, 2);
    assert.equal(catalog.products.length, 1);
    assert.equal(catalog.products[0].urlKey, "first-product");
    assert.equal(catalog.totalCount, 25);
    assert.equal(catalog.currentPage, 2);
    assert.equal(catalog.totalPages, 3);
    assert.equal(catalog.hasPreviousPage, true);
    assert.equal(catalog.hasNextPage, true);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("getCatalogPage forwards normalized search term", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const requestBody = typeof init?.body === "string" ? JSON.parse(init.body) as {
      variables?: { search?: string };
    } : {};
    assert.equal(requestBody.variables?.search, "wireless earbuds");

    return jsonResponse({
      data: {
        products: {
          items: [],
          total_count: 0,
          page_info: { current_page: 1, total_pages: 1 }
        }
      }
    });
  }) as typeof fetch;

  try {
    const catalog = await getCatalogPage(12, 1, "  wireless   earbuds  ");
    assert.equal(catalog.totalCount, 0);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("getCatalogPage filters products with missing SKU or url_key", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async () => jsonResponse({
    data: {
      products: {
        items: [
          { sku: "SKU-VALID", name: "Valid", url_key: "valid-product" },
          { sku: "", name: "Missing SKU", url_key: "missing-sku" },
          { sku: "SKU-NO-URL", name: "Missing URL", url_key: "" }
        ],
        total_count: 3,
        page_info: { current_page: 1, total_pages: 1 }
      }
    }
  })) as typeof fetch;

  try {
    const catalog = await getCatalogPage(12, 1);
    assert.equal(catalog.products.length, 1);
    assert.equal(catalog.products[0].sku, "SKU-VALID");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("getProductByUrlKey returns null when product is not found", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const requestBody = typeof init?.body === "string" ? JSON.parse(init.body) as {
      variables?: { urlKey?: string };
    } : {};
    assert.equal(requestBody.variables?.urlKey, "missing-product");
    return jsonResponse({
      data: {
        products: {
          items: []
        }
      }
    });
  }) as typeof fetch;

  try {
    const product = await getProductByUrlKey("missing-product");
    assert.equal(product, null);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});
