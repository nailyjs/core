// @ts-check
import naily from '@nailyjs/eslint'

export default naily({
  type: 'lib',
  rules: {
    'antfu/curly': 'off',
    'antfu/if-newline': 'off',
    'ts/method-signature-style': 'off',
    'ts/no-wrapper-object-types': 'off',
    'no-console': 'off',
    'unicorn/throw-new-error': 'off',
  },
})
