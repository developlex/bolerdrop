import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStorefrontConfig } from "@/src/lib/config";
import { STOREFRONT_THEME_COOKIE, STOREFRONT_THEME_IDS, normalizeStorefrontThemeId } from "@/src/themes/themes";

export async function GET() {
  const cookieStore = await cookies();
  const themeFromCookie = normalizeStorefrontThemeId(cookieStore.get(STOREFRONT_THEME_COOKIE)?.value);
  const { storefrontTheme: themeFromEnv } = getStorefrontConfig();
  const activeTheme = themeFromCookie ?? themeFromEnv;

  return NextResponse.json({
    theme: {
      active: activeTheme,
      source: themeFromCookie ? "cookie" : "env",
      available: STOREFRONT_THEME_IDS
    }
  });
}
