import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0A0A0A",
          surface: "#141414",
          hover: "#1A1A1A",
        },
        border: {
          DEFAULT: "#2A2A2A",
          subtle: "#1F1F1F",
        },
        primary: {
          DEFAULT: "#C0392B",
          hover: "#E74C3C",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#888888",
          muted: "#555555",
        },
        success: "#27AE60",
        warning: "#F39C12",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(0.98)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "craving-pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
      minHeight: {
        "touch": "44px",
      },
      minWidth: {
        "touch": "44px",
      },
    },
  },
  plugins: [],
};

export default config;
