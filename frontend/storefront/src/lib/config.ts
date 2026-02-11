export type StorefrontConfig = {
  commerceGraphqlUrl: string;
  storefrontBaseUrl: string;
};

export function getStorefrontConfig(): StorefrontConfig {
  return {
    commerceGraphqlUrl: process.env.COMMERCE_GRAPHQL_URL || "http://magento-web/graphql",
    storefrontBaseUrl: process.env.STOREFRONT_BASE_URL || "http://localhost:8281"
  };
}
