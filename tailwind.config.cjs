/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1E212D",
        foreground: "#FFFFFF",
        card: "#2A2D3A",
        cardForeground: "#FFFFFF",
        primary: "#00FF87",
        primaryForeground: "#1E212D",
        muted: "#1E212D",
        mutedForeground: "#9CA3AF",
        border: "#374151",
        inputBg: "#2A2D3A",
      },
      fontFamily: {
        sans: ["Lato", "system-ui", "sans-serif"],
        heading: ["Montserrat", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.625rem",
      },
    },
  },
  plugins: [],
};
