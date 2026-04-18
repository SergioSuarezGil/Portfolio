import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', '.vite/**'],
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js, prettier: eslintPluginPrettier },
    extends: ['js/recommended', prettier],
    languageOptions: { globals: globals.browser },
    rules: {
      'prettier/prettier': 'error',
    },
  },
]);
