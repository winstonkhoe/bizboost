/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgba(37, 136, 66, 1)',
        'primary-dark': '#1e572b',
        'primary-light': '#93dd91',
        secondary: '#ed2124',
        'tiktok-pink': '#ff0050',
        'tiktok-aqua': '#00f2ea',
      },
    },
  },
  plugins: [],
};
