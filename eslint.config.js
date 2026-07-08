// ESLint flat config (Expo SDK 57). Extends eslint-config-expo.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'coverage/*', 'tests/components/.disabled/*'],
  },
  {
    rules: {
      // Zod idiom: `export const X = z.object(...)` + `export type X = z.infer<typeof X>`
      // deliberately shares a name across value/type space. Not a real redeclaration.
      '@typescript-eslint/no-redeclare': 'off',
    },
  },
];
