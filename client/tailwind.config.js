/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#EAEFF4",
        surface: "#F4F7FA",
        "surface-card": "#F4F7FA",
        "surface-header": "#EBF0F5",
        "surface-muted": "#E2E7EE",
        "surface-border": "#CBD5E1",
        // The 4 Palette Colors from User
        "tt-violet": "#9D00FF",
        "tt-red": "#FE1D01",
        "tt-green": "#62FF00",
        "tt-cyan": "#00E1FF",
        // Grayscale / Neutral Grayish Theme
        "tt-slate": {
          950: "#020617",
          900: "#0F172A",
          850: "#1E293B",
          800: "#334155",
          700: "#475569",
          600: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#DCE2E9",
          100: "#EAEFF4",
          50: "#F4F7FA"
        }
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
        '10.5': '2.625rem',
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        "glow-violet": "0 0 20px rgba(157, 0, 255, 0.35)",
        "glow-red": "0 0 20px rgba(254, 29, 1, 0.35)",
        "glow-green": "0 0 20px rgba(98, 255, 0, 0.35)",
        "glow-cyan": "0 0 20px rgba(0, 225, 255, 0.35)",
      }
    }
  },
  plugins: [],
}
