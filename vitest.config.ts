import { env } from 'node:process'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'clover', 'json'],
    },

    reporters: env.GITHUB_ACTIONS ? ['dot', 'github-actions'] : ['dot'],
  },
})
