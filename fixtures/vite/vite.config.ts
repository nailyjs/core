import Vue from '@vitejs/plugin-vue'
import { swc } from 'unplugin-rpc'
import NailyRpc from 'unplugin-rpc/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  esbuild: false,

  plugins: [
    Vue(),

    Inspect(),

    NailyRpc(),

    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }),
  ],
})
