/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enables class-based Dark Mode switching!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        enterprise: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          muted: '#94a3b8',
          text: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
