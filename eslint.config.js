import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  rules: {
    'antfu/curly': 'off',
    'antfu/if-newline': 'off',
    'ts/method-signature-style': 'off',
    'ts/no-wrapper-object-types': 'off',
    'no-console': 'off',
    'ts/consistent-type-imports': 'off',
    'ts/no-redeclare': 'off',
    'ts/no-namespace': 'off',
  },
})
