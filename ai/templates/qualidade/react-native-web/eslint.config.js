// Modelo de eslint.config.js para módulos React Native Web (padrao-codigo, regras Q-01 a Q-09).
// Copie para <modulo>/eslint.config.js. Devs: eslint, typescript-eslint, eslint-plugin-react,
// eslint-plugin-react-hooks, @eslint-community/eslint-plugin-eslint-comments, eslint-config-prettier.
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const comentarios = require('@eslint-community/eslint-plugin-eslint-comments');
const prettier = require('eslint-config-prettier');

const SEM_COMENTARIOS_E_BRANCOS = { skipBlankLines: true, skipComments: true };
const ATRIBUTOS_DE_TEXTO = '/^(placeholder|label|title|accessibilityLabel|accessibilityHint|alt)$/';

module.exports = tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', 'web-build/**', '.expo/**', 'coverage/**', '*.config.js'] },
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks, '@eslint-community/eslint-comments': comentarios },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Q-01
      'max-len': ['error', { code: 120, ignoreUrls: false, ignoreStrings: false, ignoreTemplateLiterals: false }],
      // Q-03 (produção e teste)
      'max-lines-per-function': ['error', { max: 20, ...SEM_COMENTARIOS_E_BRANCOS }],
      // Q-04
      'max-params': ['error', 3],
      // Q-06 (a classe de logging é liberada na seção de exceções abaixo)
      'no-console': 'error',
      // Q-07 (texto solto em JSX) e Q-05 (texto de negócio em atributos e em Alert)
      'react/jsx-no-literals': ['error', { noStrings: false }],
      'no-restricted-syntax': [
        'error',
        {
          selector: `JSXAttribute[name.name=${ATRIBUTOS_DE_TEXTO}] > Literal[value=/\\s/]`,
          message: 'Q-05/Q-07: texto fixo em atributo; use a classe de mensagens (texto de uma palavra: leitura do agente-testes).',
        },
        {
          selector: "CallExpression[callee.object.name='Alert'] > Literal",
          message: 'Q-05/Q-07: texto fixo em Alert; use a classe de mensagens.',
        },
      ],
      // Q-08
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'memberLike', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
      ],
      // Q-09
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unreachable': 'error',
      'no-unused-private-class-members': 'error',
      // Exceção justificada: // eslint-disable-next-line <regra> -- qualidade-exceção: <motivo>
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
    },
  },
  {
    // Q-02: classe/módulo de produção com no máximo 100 linhas de código.
    files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: { 'max-lines': ['error', { max: 100, ...SEM_COMENTARIOS_E_BRANCOS }] },
  },
  {
    // Testes e mensagens: texto fixo é esperado.
    files: ['__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', 'src/**/mensagens*.ts', 'src/**/messages*.ts'],
    rules: { 'react/jsx-no-literals': 'off', 'no-restricted-syntax': 'off' },
  },
  {
    // Q-06: único ponto autorizado a usar console.
    files: ['src/core/logger.ts'],
    rules: { 'no-console': 'off' },
  },
);
