import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/src/components/header";
import { getStorefrontBaseUrl } from "@/src/lib/seo";
import { ui } from "@/src/ui/styles";

const metadataBase = getStorefrontBaseUrl();

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className={ui.layout.shell}>{children}</main>
      </body>
    </html>
  );
}
