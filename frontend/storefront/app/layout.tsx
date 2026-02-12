import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { cookies } from "next/headers";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/src/components/header";
import { getStorefrontBaseUrl } from "@/src/lib/seo";
import { getStorefrontConfig } from "@/src/lib/config";
import { getStorefrontTheme, STOREFRONT_THEME_COOKIE, normalizeStorefrontThemeId } from "@/src/themes/themes";
import { ui } from "@/src/ui/styles";

const metadataBase = getStorefrontBaseUrl();
const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});
const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase,
  title: "BoilerDrop Storefront",
  description: "Headless storefront powered by Magento GraphQL",
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1
    }
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeFromCookie = normalizeStorefrontThemeId(cookieStore.get(STOREFRONT_THEME_COOKIE)?.value);
  const { storefrontTheme: themeFromEnv } = getStorefrontConfig();
  const storefrontThemeId = themeFromCookie ?? themeFromEnv;
  const storefrontTheme = getStorefrontTheme(storefrontThemeId);

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${bodyFont.variable} ${headingFont.variable} ${storefrontTheme.bodyClassName} min-h-screen`}
        style={storefrontTheme.cssVariables as CSSProperties}
      >
        <div aria-hidden="true" className="site-noise" />
        <Header activeThemeId={storefrontThemeId} />
        <main className={`${ui.layout.shell} page-reveal`}>{children}</main>
      </body>
    </html>
  );
}
