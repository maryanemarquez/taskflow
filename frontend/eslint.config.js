const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['coverage/**', 'dist/**'],
    rules: {
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'error',
        { max: 20, skipBlankLines: true, skipComments: true },
      ],
      'max-params': ['error', 3],
      'no-console': 'error',
      'no-unreachable': 'error',
      'react/jsx-no-literals': 'error',
    },
  },
];
