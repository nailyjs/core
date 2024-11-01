import { env } from 'node:process'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: env.GITHUB_ACTIONS ? [] : ['html', 'clover', 'json'],
    },

    reporters: env.GITHUB_ACTIONS ? ['github-actions'] : ['dot'],
  },
})
