import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  rules: {
    'ts/no-unsafe-function-type': 'off',
    'ts/no-namespace': 'off',
    'antfu/if-newline': 'off',
    'ts/method-signature-style': 'off',
    'antfu/curly': 'off',
    'no-console': 'off',
    'ts/no-wrapper-object-types': 'off',
    'ts/no-redeclare': 'off',
    'unused-imports/no-unused-imports': 'off',
  },
})
