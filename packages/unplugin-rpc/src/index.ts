import type { RpcBootstrap } from '@nailyjs/rpc'
import path from 'node:path'
import { env, exit } from 'node:process'
import { importx } from 'importx-tsup'
import { createUnplugin, UnpluginFactory } from 'unplugin'
import { buildServer } from './core/build'
import { useViteDevServer } from './core/vite-server-adapter'
import { Options } from './types'

let __filename = globalThis.__filename
if (!globalThis.__filename)
  __filename = new URL(import.meta.url).pathname

export * from './core'
export const unpluginFactory: UnpluginFactory<Options> = (options, meta) => {
  if (meta.framework !== 'vite') throw new Error(`[unplugin-rpc] Unsupported framework: ${meta.framework}, current only support vite.`)

  return [
    {
      name: 'naily:unplugin-rpc',

      vite: {
        config(config) {
          if (!config || !config.build || !config.build.outDir) {
            config = config || {}
            config.build = config.build || {}
            if (!config.build.outDir)
              config.build.outDir = 'dist/frontend'
          }
        },

        async configureServer(server) {
          await useViteDevServer(options || {}, server).run()
        },

        configurePreviewServer(server) {
          const baseURL = ((options || {}).preview || {}).baseURL || '/rpc'
          const serverEntry = ((options || {}).preview || {}).serverEntry || path.resolve('./dist/backend/main.js')
          env.NODE_ENV = 'preview'
          server.middlewares.use(baseURL, async (req, res) => {
            const result = await importx(serverEntry, __filename)
            const app: RpcBootstrap = result[options.entryExport || 'app']
            await useViteDevServer(options || {}, server).init(app, req, res)
          })
        },

        closeBundle() {
          if (((options || {}).build || {}).on === 'closeBundle')
            buildServer(options).then(() => exit(0))
        },
      },
    },
  ]
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
