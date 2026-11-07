// Gemeinsame ESLint-Basis (flat config). Apps erweitern sie in ihrer eigenen eslint.config.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const base = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  prettier,
);

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'apps/**',
      'supabase/functions/**',
      '.agents/**',
      '.claude/**',
    ],
  },
  ...base,
  {
    files: ['scripts/**/*.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },
);
