// Tailwind CSS configuration (classic) replacing experimental @theme tokens
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#FFFF00',
        accent: '#FFD700',
        'brand-dark': '#1a1a1a',
        'brand-light': '#FFFACD'
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        heading: ['Poppins', ...defaultTheme.fontFamily.sans]
      },
      spacing: {
        18: '4.5rem',
        88: '22rem'
      }
    }
  },
  plugins: []
};

