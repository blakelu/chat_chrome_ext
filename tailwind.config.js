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
        '.el-button': {
          'background-color': 'var(--el-button-bg-color,var(--el-color-white))'
        }
      })
    }
  ]
}
