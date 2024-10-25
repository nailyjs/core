import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': './src/index.ts',
    'utils': './src/utils.ts',
    'node-adapter': './src/node-adapter.ts',
  },
  dts: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
})
