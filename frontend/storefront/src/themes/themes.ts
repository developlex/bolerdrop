export const STOREFRONT_THEME_IDS = ["dropship", "sunset"] as const;
export const STOREFRONT_THEME_COOKIE = "storefront_theme";

export type StorefrontThemeId = (typeof STOREFRONT_THEME_IDS)[number];

export type StorefrontTheme = {
  id: StorefrontThemeId;
  label: string;
  bodyClassName: string;
  cssVariables: Record<string, string>;
};

const THEME_REGISTRY: Record<StorefrontThemeId, StorefrontTheme> = {
  dropship: {
    id: "dropship",
    label: "Magento Dropship",
    bodyClassName: "theme-dropship",
    cssVariables: {
      "--color-ink": "#2b2b2b",
      "--color-mist": "#ffffff",
      "--color-ember": "#b9773f",
      "--color-steel": "#6b7280",
      "--color-sand": "#f7f6f4",
      "--color-ocean": "#415c73",
      "--color-sun": "#d89355",
      "--site-background":
        "radial-gradient(circle at 22% 12%, rgba(255,255,255,0.9), transparent 40%), radial-gradient(circle at 84% 18%, rgba(243,181,126,0.2), transparent 34%), linear-gradient(180deg, #f6f4f1 0%, #fbfaf8 42%, #f6f4f1 100%)",
      "--site-noise-opacity": "0.08",
      "--site-topbar-background": "rgba(255,255,255,0.94)",
      "--site-topbar-border": "rgba(17,24,39,0.08)",
      "--site-header-background": "rgba(255,255,255,0.9)",
      "--site-header-border": "rgba(17,24,39,0.08)"
    }
  },
  sunset: {
    id: "sunset",
    label: "Sunset Editorial",
    bodyClassName: "theme-sunset",
    cssVariables: {
      "--color-ink": "#13202f",
      "--color-mist": "#f5efe4",
      "--color-ember": "#be4f2e",
      "--color-steel": "#5f6978",
      "--color-sand": "#fff8ed",
      "--color-ocean": "#0f6f67",
      "--color-sun": "#e59b52",
      "--site-background":
        "radial-gradient(circle at 12% 18%, rgba(229,155,82,0.22), transparent 28%), radial-gradient(circle at 88% 8%, rgba(15,111,103,0.18), transparent 24%), radial-gradient(circle at 60% 92%, rgba(190,79,46,0.2), transparent 28%), linear-gradient(180deg, #fff8ed 0%, #f8f2e8 44%, #f1ebdf 100%)",
      "--site-noise-opacity": "0.22",
      "--site-topbar-background": "rgba(255,248,237,0.9)",
      "--site-topbar-border": "rgba(19,32,47,0.08)",
      "--site-header-background": "rgba(255,255,255,0.76)",
      "--site-header-border": "rgba(19,32,47,0.08)"
    }
  }
};

export function isStorefrontThemeId(value: string): value is StorefrontThemeId {
  return Object.hasOwn(THEME_REGISTRY, value);
}

export function normalizeStorefrontThemeId(value: string | null | undefined): StorefrontThemeId | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return isStorefrontThemeId(normalized) ? normalized : null;
}

export function getStorefrontTheme(themeId: StorefrontThemeId): StorefrontTheme {
  return THEME_REGISTRY[themeId];
}
