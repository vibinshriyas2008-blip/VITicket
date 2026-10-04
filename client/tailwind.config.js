/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vit: {
          blue: '#1e3a8a',
          navy: '#0f172a',
          accent: '#3b82f6',
          gold: '#eab308',
        }
      }
    },
  },
  plugins: [],
}
