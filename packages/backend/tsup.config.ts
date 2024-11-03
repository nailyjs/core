import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': './src/index.ts',
    'node-adapter': './adapters/node/index.ts',
  },
  dts: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
})
