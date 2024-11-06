import path from 'node:path'
import { cwd } from 'node:process'
import { defineConfig } from './packages/config/src/helper'

export default defineConfig({
  naily: {
    eslint: {
      type: 'lib',
      rules: {
        'antfu/curly': 'off',
        'antfu/if-newline': 'off',
        'ts/method-signature-style': 'off',
        'ts/no-wrapper-object-types': 'off',
        'no-console': 'off',
        'unicorn/throw-new-error': 'off',
      },
    },

    typeorm: {
      type: 'sqlite',
      database: path.join(cwd(), './node_modules/.cache/naily/typeorm.db'),
      name: 'default',
      synchronize: true,
      logging: true,
    },
  },
})
