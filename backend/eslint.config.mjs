import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['/**/*.js', 'build/', 'coverage/'] },
  { languageOptions: { globals: { ...globals.node, ...globals.es2022 } } },
  ...tseslint.configs.recommended,
  jestPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
