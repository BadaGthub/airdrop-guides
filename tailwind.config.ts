import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#101828", soft: "#475467", faint: "#98A2B3" },
        paper: { DEFAULT: "#EEF1F6", card: "#FFFFFF", line: "#DCE1EA" },
        cobalt: { DEFAULT: "#2B50F5", dark: "#1D3BC4", tint: "#E8EDFF" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04)" },
    },
  },
  plugins: [],
};
export default config;
