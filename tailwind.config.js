/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        crest: ['"Cinzel"', 'serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        academic: {
          primary: '#26648E',     // Deep Classic Ocean / Academic Blue
          primaryHover: '#1f5072',
          secondary: '#4F8FC0',   // Soft Cerulean / Slate Blue
          cyan: '#53D2DC',        // Vibrant Cyan / Turquoise Accent
          cyanHover: '#3ec8d3',
          peach: '#FFE3B3',       // Warm Cream / Soft Champagne Peach
          peachBorder: '#fedba0',
          bgPage: '#f8fafc',
          bgSidebar: '#f0f5f9',
          border: 'rgba(79, 143, 192, 0.25)',
        },
        brand: {
          50: "#f0f5f9",
          100: "#e0edf5",
          200: "#c3dbe9",
          300: "#95c0dc",
          400: "#4F8FC0",
          500: "#3777a8",
          600: "#26648E",
          700: "#1f5072",
          800: "#1b4360",
          900: "#163850",
        },
        sidebar: {
          bg: "#f0f5f9",
          card: "#ffffff",
          hover: "#e8f1f7",
          border: "rgba(79, 143, 192, 0.25)",
          text: "#334155",
          active: "#26648E",
        }
      },
    },
  },
  plugins: [],
};
