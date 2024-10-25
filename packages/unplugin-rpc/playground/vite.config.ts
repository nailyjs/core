import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Rpc from '../src/vite'

export default defineConfig({
  plugins: [
    Inspect(),
    Rpc(),
  ],
})
