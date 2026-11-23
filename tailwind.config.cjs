/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Green-ink mushaf palette from the study pack.
        brand: {
          50: '#E8F3F0', 100: '#C6E3DB', 200: '#98CDBF', 300: '#5FB09D', 400: '#2E937D',
          500: '#11796A', 600: '#0B5D4F', 700: '#094E43', 800: '#073F36', 900: '#052E28',
        },
        gold: { 50: '#FFF7E6', 100: '#FBEACB', 300: '#E6CF98', 500: '#C08A2B', 600: '#A8761D', 700: '#86590F' },
      },
      fontFamily: {
        ui: ['Cairo', '"Noto Naskh Arabic"', 'system-ui', 'sans-serif'],
        body: ['"Noto Naskh Arabic"', 'Amiri', 'serif'],
        display: ['Amiri', '"Noto Naskh Arabic"', 'serif'],
        quran: ['"Amiri Quran"', 'Amiri', 'serif'],
      },
    },
  },
  plugins: [],
};
