import swc from 'unplugin-swc'
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    globals: true,
  },

  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
          tsx: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }) as any,
  ],
})
