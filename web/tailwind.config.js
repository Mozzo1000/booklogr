/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        libre: ['"Libre Baskerville"', ...defaultTheme.fontFamily.sans]
      },
      backgroundImage: {
        'wave-pattern': "url('/wave.svg')",
      }
    },
  },
  plugins: [require("flowbite/plugin"), require('flowbite-typography'),],
}

