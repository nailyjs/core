import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { createFilter } from '@rollup/pluginutils'
import { createUnplugin, UnpluginFactory } from 'unplugin'
import { useViteDevServer } from './core/vite-server-adapter'
import { Options } from './types'

export const unpluginFactory: UnpluginFactory<Options> = (options, meta) => {
  if (meta.framework !== 'vite') throw new Error(`[unplugin-rpc] Unsupported framework: ${meta.framework}, current only support vite.`)
  const watchDirs = options?.watchDirs || ['./backend/**/*']

  return {
    name: 'naily:unplugin-rpc',

    vite: {
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
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
