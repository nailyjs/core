import { exit } from 'node:process'
import { createUnplugin, UnpluginFactory } from 'unplugin'
import { buildServer } from './core/build'
import { useViteDevServer } from './core/vite-server-adapter'
import { Options } from './types'

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
