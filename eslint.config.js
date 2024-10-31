import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  rules: {
    'antfu/curly': 'off',
    'antfu/if-newline': 'off',
    'ts/method-signature-style': 'off',
  },
})
