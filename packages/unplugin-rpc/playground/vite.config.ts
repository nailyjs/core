/* eslint-disable antfu/no-import-dist */

import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Rpc, { swc } from '../dist'

export default defineConfig({
  plugins: [
    Inspect(),

    swc(),

    Rpc.vite({
      viteOptions: {
        plugins: [
          swc(),
        ],
      },
    }),
  ],
})
