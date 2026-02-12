import { STOREFRONT_THEME_IDS, type StorefrontThemeId, normalizeStorefrontThemeId } from "@/src/themes/themes";

export type StorefrontConfig = {
  commerceGraphqlUrl: string;
  storefrontBaseUrl: string;
  storefrontTheme: StorefrontThemeId;
};

const DEFAULT_STOREFRONT_THEME: StorefrontThemeId = STOREFRONT_THEME_IDS[0];

function resolveStorefrontTheme(): StorefrontThemeId {
  const resolved = normalizeStorefrontThemeId(process.env.STOREFRONT_THEME);
  if (resolved) {
    return resolved;
  }
  return DEFAULT_STOREFRONT_THEME;
}

export function getStorefrontConfig(): StorefrontConfig {
  return {
    commerceGraphqlUrl: process.env.COMMERCE_GRAPHQL_URL || "http://magento-web/graphql",
    storefrontBaseUrl: process.env.STOREFRONT_BASE_URL || "http://localhost:8281",
    storefrontTheme: resolveStorefrontTheme()
  };
}
