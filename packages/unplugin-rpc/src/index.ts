import fs from 'node:fs'
import path from 'node:path'
import { cwd, exit } from 'node:process'
import { createFilter } from '@rollup/pluginutils'
import { createUnplugin, UnpluginFactory } from 'unplugin'
import { buildServer } from './core/build'
import { hmrLogger } from './core/hmr-logger'
import { swcUnplugin } from './core/swc'
import { useViteDevServer } from './core/vite-server-adapter'
import { Options } from './types'

export * from './core/build'
export * from './core/factory'
export * from './core/swc'
export const unpluginFactory: UnpluginFactory<Options> = (options, meta) => {
  if (meta.framework !== 'vite') throw new Error(`[unplugin-rpc] Unsupported framework: ${meta.framework}, current only support vite.`)
  const watchDirs = options?.watchDirs || ['./backend/**/*']

  return [
    swcUnplugin,
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
          const viteDevServer = await useViteDevServer(options || {}, server).run()

          if (fs.existsSync(path.join(cwd(), 'naily.config.ts')))
            server.watcher.add(path.join(cwd(), 'naily.config.ts'))

          server.watcher.add(watchDirs).on('change', async (filePath) => {
            const isWatchedFile = createFilter(watchDirs)(filePath)
            if (!isWatchedFile || filePath !== path.join(cwd(), 'naily.config.ts'))
              return
            await viteDevServer.run()
          })
        },

        handleHotUpdate(ctx) {
          const moduleFilePaths = ctx.modules.map(mod => mod.file)
            // 过滤掉空文件
            .filter(file => file)
            // 过滤掉不在 watchDirs 中的文件
            .filter(file => createFilter(watchDirs)(file)) as string[]

          if (moduleFilePaths.length === 0)
            return

          ctx.server.moduleGraph.invalidateAll()
          ctx.server.ws.send({ type: 'full-reload' })
          if (ctx.server.config.clearScreen !== false) console.clear()
          hmrLogger(moduleFilePaths.map(file => path.isAbsolute(file) ? path.relative(cwd(), file) : file))
          return []
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
