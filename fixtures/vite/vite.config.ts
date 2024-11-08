import Vue from '@vitejs/plugin-vue'
import { swc } from 'unplugin-rpc'
import NailyRpc from 'unplugin-rpc/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    Inspect(),

    Vue(),

    NailyRpc(),

    swc.vite({}),
  ],
})
