import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/src/components/header";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "BoilerDrop Storefront",
  description: "Headless storefront powered by Magento GraphQL"
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
