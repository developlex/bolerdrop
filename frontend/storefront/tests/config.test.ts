import test from "node:test";
import assert from "node:assert/strict";
import { getStorefrontConfig } from "@/src/lib/config";

test("config returns defaults when env not set", () => {
  const oldGraphql = process.env.COMMERCE_GRAPHQL_URL;
  const oldBase = process.env.STOREFRONT_BASE_URL;
  const oldTheme = process.env.STOREFRONT_THEME;

  delete process.env.COMMERCE_GRAPHQL_URL;
  delete process.env.STOREFRONT_BASE_URL;
  delete process.env.STOREFRONT_THEME;

  const config = getStorefrontConfig();
  assert.equal(config.commerceGraphqlUrl, "http://magento-web/graphql");
  assert.equal(config.storefrontBaseUrl, "http://localhost:8281");
  assert.equal(config.storefrontTheme, "dropship");

  if (oldGraphql !== undefined) {
    process.env.COMMERCE_GRAPHQL_URL = oldGraphql;
  }
  if (oldBase !== undefined) {
    process.env.STOREFRONT_BASE_URL = oldBase;
  }
  if (oldTheme !== undefined) {
    process.env.STOREFRONT_THEME = oldTheme;
  }
});

test("config normalizes and validates storefront theme", () => {
  const oldTheme = process.env.STOREFRONT_THEME;

  process.env.STOREFRONT_THEME = "sunset";
  assert.equal(getStorefrontConfig().storefrontTheme, "sunset");

  process.env.STOREFRONT_THEME = "SunSet";
  assert.equal(getStorefrontConfig().storefrontTheme, "sunset");

  process.env.STOREFRONT_THEME = "unknown-theme";
  assert.equal(getStorefrontConfig().storefrontTheme, "dropship");

  if (oldTheme === undefined) {
    delete process.env.STOREFRONT_THEME;
  } else {
    process.env.STOREFRONT_THEME = oldTheme;
  }
});
