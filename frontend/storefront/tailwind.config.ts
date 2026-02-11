import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111318",
        mist: "#f4f6f8",
        ember: "#c34d28",
        steel: "#6b7280"
      }
    }
  },
  plugins: []
};

export default config;
