/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["DM Serif Display", "serif"],
      },
      colors: {
        green: {
          50:  "#f0faf4",
          100: "#d9f2e3",
          200: "#b6e5cb",
          300: "#84d0a9",
          400: "#4db480",
          500: "#2d9960",
          600: "#1f7d4b",
          700: "#1a643d",
          800: "#175032",
          900: "#14422a",
          950: "#0a2518",
        },
        sage: {
          50:  "#f4f7f4",
          100: "#e4ebe4",
          200: "#c9d7ca",
          300: "#a0b8a2",
          400: "#729476",
          500: "#527856",
          600: "#406044",
          700: "#354e38",
          800: "#2c402f",
          900: "#253528",
        },
        cream: "#f7f8f5",
        surface: "#ffffff",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)",
        glow: "0 0 24px rgba(45,153,96,0.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        pulse2: "pulse2 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulse2: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
};
