import swc from 'unplugin-swc'
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    globals: true,
  },

  esbuild: false,

  plugins: [
    swc.vite({
      jsc: {
        parser: {
          decorators: true,
          tsx: true,
          syntax: 'typescript',
        },
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true,
        },
      },
    }),
  ],
})
