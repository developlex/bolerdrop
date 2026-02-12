import type { Config } from "tailwindcss";

export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#fff7f0",
                    100: "#ffe7d2",
                    200: "#ffd0a8",
                    300: "#f3b57e",
                    400: "#d89355",
                    500: "#b9773f", // primary brown-ish
                    600: "#9e6333",
                    700: "#7f4e28",
                    800: "#5d381c",
                    900: "#3b2412",
                },
                ink: "#2b2b2b",
                muted: "#6b7280",
                line: "#e5e7eb",
                panel: "#f7f6f4",
            },
            boxShadow: {
                soft: "0 10px 30px rgba(0,0,0,.08)",
                card: "0 8px 18px rgba(0,0,0,.10)",
            },
            borderRadius: {
                xl2: "1.25rem",
            },
        },
    },
    plugins: [],
} satisfies Config;
