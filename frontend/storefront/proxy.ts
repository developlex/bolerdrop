import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STOREFRONT_THEME_COOKIE, normalizeStorefrontThemeId } from "@/src/themes/themes";

export function proxy(request: NextRequest) {
  const themeParam = request.nextUrl.searchParams.get("theme");
  if (!themeParam) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.searchParams.delete("theme");
  const response = NextResponse.redirect(url);
  const parsedTheme = normalizeStorefrontThemeId(themeParam);

  if (parsedTheme) {
    response.cookies.set(STOREFRONT_THEME_COOKIE, parsedTheme, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      secure: request.nextUrl.protocol === "https:"
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
