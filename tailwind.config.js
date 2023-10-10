/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#258842',
        'primary-dark': '#1e572b',
        'primary-light': '#93dd91',
        secondary: '#ed2124',
      },
    },
  },
  plugins: [],
};
