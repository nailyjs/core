/* eslint-disable antfu/no-import-dist */

import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Rpc from '../dist/vite'

export default defineConfig({
  plugins: [
    Inspect(),

    Rpc(),
  ],
})
