import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    main: './src/main.ts',
  },
  dts: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
})
