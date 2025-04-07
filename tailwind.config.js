/** @type {import('tailwindcss').Config} */
export default {
  // corePlugins: {
  //   preflight: false,
  // },
  content: ['./popup.html', './options.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        '.closeai-button': {
          'background-color': 'var(--closeai-button-bg-color,var(--closeai-color-white))'
        }
      })
    }
  ]
}
