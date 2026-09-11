import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
  ]),

  {
    rules: {
      // Keep the module graph readable: every cross-directory import goes
      // through the @/ alias rather than a chain of "../".
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                'Use the "@/" alias instead of a parent-relative import.',
            },
          ],
        },
      ],

      // Unused values are a typecheck error already; flag the rest here, with
      // the standard underscore escape hatch for intentionally ignored args.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // `any` erases the guarantees the rest of this codebase relies on.
      '@typescript-eslint/no-explicit-any': 'error',

      // console.warn/error are used deliberately for server-side diagnostics;
      // stray console.log is usually debugging left behind.
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
    },
  },

  {
    // Route handlers and server libraries legitimately log to stdout.
    files: ['src/app/api/**/*.ts', 'src/lib/**/*.ts', 'src/proxy.ts'],
    rules: { 'no-console': 'off' },
  },

  {
    // The setup script is a standalone Node CLI, not part of the app bundle.
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
]);

export default eslintConfig;
