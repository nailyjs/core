import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/*',
  ],
  dts: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
  external: ['vite', 'defu'],
})
