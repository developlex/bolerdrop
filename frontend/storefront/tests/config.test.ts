import test from "node:test";
import assert from "node:assert/strict";
import { getStorefrontConfig } from "@/src/lib/config";

test("config returns defaults when env not set", () => {
  const oldGraphql = process.env.COMMERCE_GRAPHQL_URL;
  const oldBase = process.env.STOREFRONT_BASE_URL;

  delete process.env.COMMERCE_GRAPHQL_URL;
  delete process.env.STOREFRONT_BASE_URL;

  const config = getStorefrontConfig();
  assert.equal(config.commerceGraphqlUrl, "http://magento-web/graphql");
  assert.equal(config.storefrontBaseUrl, "http://localhost:8281");

  if (oldGraphql !== undefined) {
    process.env.COMMERCE_GRAPHQL_URL = oldGraphql;
  }
  if (oldBase !== undefined) {
    process.env.STOREFRONT_BASE_URL = oldBase;
  }
});
