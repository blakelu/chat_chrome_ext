module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['plugin:vue/vue3-essential', 'standard-with-typescript', 'plugin:prettier/recommended'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser'
  },
  plugins: ['vue'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'generator-star-spacing': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'no-unused-vars': 'off'
  },
  globals: {
    BMapGL: true,
    mapvgl: true
  }
}
