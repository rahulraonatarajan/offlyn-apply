import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.js', '**/*.mjs'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Flag but don't block — existing code has `as any` casts that need gradual cleanup
      '@typescript-eslint/no-explicit-any': 'warn',

      // Real bug risk — unused vars are errors
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Warn on console usage — extensions should keep these minimal in prod
      'no-console': 'warn',

      // These are genuine errors
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
);
