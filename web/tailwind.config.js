/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const flowbite = require("flowbite-react/tailwind");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      fontFamily: {
        libre: ['"Libre Baskerville"', ...defaultTheme.fontFamily.sans]
      },
      backgroundImage: {
        'wave-pattern': "url('/wave.svg')",
        'wave-02-pattern': "url('/wave_02.svg')",
      }
    },
  },
  plugins: [flowbite.plugin(), require('flowbite-typography'),],
}

