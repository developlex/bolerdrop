import test from "node:test";
import assert from "node:assert/strict";
import {
  deleteCartCookie,
  deleteCustomerTokenCookie,
  getScopedCookieName,
  readCartCookie,
  readCustomerTokenCookie,
  setCartCookie,
  setCustomerTokenCookie
} from "@/src/lib/session-cookies";

type CookieValue = {
  value: string;
};

class FakeCookieStore {
  private readonly storage = new Map<string, string>();

  get(name: string): CookieValue | undefined {
    const value = this.storage.get(name);
    return typeof value === "string" ? { value } : undefined;
  }

  set(name: string, value: string, _options?: unknown): void {
    this.storage.set(name, value);
  }

  delete(name: string): void {
    this.storage.delete(name);
  }
}

test("scoped cookie names use STORE_ID namespace", { concurrency: false }, () => {
  const previousStoreId = process.env.STORE_ID;
  const previousBaseUrl = process.env.STOREFRONT_BASE_URL;
  process.env.STORE_ID = "shop-test";
  process.env.STOREFRONT_BASE_URL = "http://localhost:8283";

  try {
    assert.equal(getScopedCookieName("cart_id"), "cart_id__shop-test");
    assert.equal(getScopedCookieName("customer_token"), "customer_token__shop-test");
  } finally {
    if (previousStoreId === undefined) {
      delete process.env.STORE_ID;
    } else {
      process.env.STORE_ID = previousStoreId;
    }
    if (previousBaseUrl === undefined) {
      delete process.env.STOREFRONT_BASE_URL;
    } else {
      process.env.STOREFRONT_BASE_URL = previousBaseUrl;
    }
  }
});

test("read helpers fallback to legacy cookie names", { concurrency: false }, () => {
  const previousStoreId = process.env.STORE_ID;
  const previousBaseUrl = process.env.STOREFRONT_BASE_URL;
  process.env.STORE_ID = "shop-test";
  process.env.STOREFRONT_BASE_URL = "http://localhost:8283";

  try {
    const cookieStore = new FakeCookieStore();
    cookieStore.set("cart_id", "legacy-cart");
    cookieStore.set("customer_token", "legacy-token");

    assert.equal(readCartCookie(cookieStore), "legacy-cart");
    assert.equal(readCustomerTokenCookie(cookieStore), "legacy-token");
  } finally {
    if (previousStoreId === undefined) {
      delete process.env.STORE_ID;
    } else {
      process.env.STORE_ID = previousStoreId;
    }
    if (previousBaseUrl === undefined) {
      delete process.env.STOREFRONT_BASE_URL;
    } else {
      process.env.STOREFRONT_BASE_URL = previousBaseUrl;
    }
  }
});

test("set/delete helpers write scoped cookies and clean legacy keys", { concurrency: false }, () => {
  const previousStoreId = process.env.STORE_ID;
  const previousBaseUrl = process.env.STOREFRONT_BASE_URL;
  process.env.STORE_ID = "shop-test";
  process.env.STOREFRONT_BASE_URL = "http://localhost:8283";

  try {
    const cookieStore = new FakeCookieStore();
    cookieStore.set("cart_id", "legacy-cart");
    cookieStore.set("customer_token", "legacy-token");

    setCartCookie(cookieStore, "scoped-cart", { path: "/" });
    setCustomerTokenCookie(cookieStore, "scoped-token", { path: "/" });

    assert.equal(readCartCookie(cookieStore), "scoped-cart");
    assert.equal(readCustomerTokenCookie(cookieStore), "scoped-token");
    assert.equal(cookieStore.get("cart_id"), undefined);
    assert.equal(cookieStore.get("customer_token"), undefined);
    assert.equal(cookieStore.get("cart_id__shop-test")?.value, "scoped-cart");
    assert.equal(cookieStore.get("customer_token__shop-test")?.value, "scoped-token");

    deleteCartCookie(cookieStore);
    deleteCustomerTokenCookie(cookieStore);

    assert.equal(cookieStore.get("cart_id__shop-test"), undefined);
    assert.equal(cookieStore.get("customer_token__shop-test"), undefined);
  } finally {
    if (previousStoreId === undefined) {
      delete process.env.STORE_ID;
    } else {
      process.env.STORE_ID = previousStoreId;
    }
    if (previousBaseUrl === undefined) {
      delete process.env.STOREFRONT_BASE_URL;
    } else {
      process.env.STOREFRONT_BASE_URL = previousBaseUrl;
    }
  }
});
