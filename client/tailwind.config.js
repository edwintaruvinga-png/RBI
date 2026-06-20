/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f9',
          100: '#d6e0ef',
          200: '#aec1df',
          300: '#7f9bca',
          400: '#5274b0',
          500: '#365796',
          600: '#284479',
          700: '#1d3461',
          800: '#142545',
          900: '#0b182f',
          950: '#070f1f',
        },
        gold: {
          50: '#fbf6e9',
          100: '#f5e8c4',
          200: '#ecd28a',
          300: '#e0b94f',
          400: '#d4af37',
          500: '#bd9526',
          600: '#9c771e',
          700: '#7a5b1c',
          800: '#5f471c',
          900: '#503c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
