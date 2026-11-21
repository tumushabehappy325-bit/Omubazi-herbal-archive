import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "#f4efe4",
          dark: "#ebe4d4",
          ink: "#2a241c",
        },
        forest: {
          DEFAULT: "#2d4a2b",
          deep: "#1e331d",
          mist: "#4a6b47",
          leaf: "#6b8f66",
        },
        clay: {
          DEFAULT: "#b85c3a",
          warm: "#c9784f",
          soft: "#e8c4b0",
        },
        moss: {
          DEFAULT: "#5c6b4a",
          pale: "#d4dcc8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "paper-grain":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ink-draw": {
          "0%": { strokeDashoffset: "120" },
          "100%": { strokeDashoffset: "0" },
        },
        "soft-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "ink-draw": "ink-draw 1.2s ease-out forwards",
        "soft-in": "soft-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
