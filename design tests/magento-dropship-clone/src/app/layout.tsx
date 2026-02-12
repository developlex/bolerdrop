import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Magento Dropship — Demo",
    description: "Next.js + Tailwind storefront homepage demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}
