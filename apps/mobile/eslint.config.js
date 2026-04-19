// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/i18n/index.ts'],
    rules: {
      // i18next default export; false positive vs named export `use`
      'import/no-named-as-default-member': 'off',
    },
  },
]);
