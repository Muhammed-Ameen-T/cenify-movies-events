module.exports = {
    env: {
      node: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier', 
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
      'no-console': 'warn', 
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off', 
      'prefer-const': 'error',
    },
  };