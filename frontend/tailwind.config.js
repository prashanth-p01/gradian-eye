/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0a0e17",
        darkPanel: "#111827",
        darkCard: "#1f293d",
        darkBorder: "#2d3748",
        brandRed: "#ef4444",
        brandOrange: "#f97316",
        brandYellow: "#eab308",
        brandGreen: "#10b981",
        brandBlue: "#3b82f6",
        brandPurple: "#8b5cf6"
      }
    },
  },
  plugins: [],
}
