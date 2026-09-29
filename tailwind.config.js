/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#FDF5F3",
          100: "#FBE8E3",
          200: "#F6D0C6",
          300: "#EFB2A3",
          400: "#E38F7A",
          500: "#D06F58",
        },
        cream: {
          50: "#FFFDFB",
          100: "#FBF5EE",
          200: "#F4E9DC",
        },
        ink: {
          800: "#2E2622",
          900: "#221C19",
        },
        gold: {
          400: "#C7A369",
          500: "#B08D50",
        },
        sage: {
          400: "#9CA98A",
          500: "#7E8D6B",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'Jost'", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
    },
  },
  plugins: [],
};
