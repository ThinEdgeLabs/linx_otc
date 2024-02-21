/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/**/**/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
      extend: {
          fontFamily: {
              sans: ['\'Nunito Sans\'', 'sans-serif'],
          },
          colors: {
              'accent-1': '#783DD4',
              'accent-2': '#5188CF',
              'accent-3': '#6660D2',
              'core-darkest': '#121421',
              'core-darker': '#191B28',
              'menu': '#1F212D',
              'core': '#707179',
              'core-light': '#B8B9BD',
              'core-lighter': '#E3E9F0',
              'core-lightest': '#F6F8FA',
              'ok': '#22B07D',
              'warning': '#FFA244',
              'danger': '#FF4444',
              'orange-border' : '#F46F2D',
              'divider' : '#2A2C38'
          },
          flexBasis: {
              '1/8': '12.5%',
          },
          margin: {
              '2px': '2px',
              '3px': '3px',
          },
          borderWidth: {
              '3': '3px',
          },
          height: {
              '3px': '3px',
          },
      },
  },
  plugins: [],
}
