import Vue from '@vitejs/plugin-vue'
import Rpc from 'unplugin-rpc/vite'
import swc from 'unplugin-swc'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    // 必须使用swc插件，因为esbuild不支持反射
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
    }),

    Inspect(),

    Vue(),

    Rpc(),
  ],
})
