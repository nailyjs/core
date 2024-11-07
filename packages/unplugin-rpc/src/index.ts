import fs from 'node:fs'
import path from 'node:path'
import { cwd, exit } from 'node:process'
import { createFilter } from '@rollup/pluginutils'
import { createUnplugin, UnpluginFactory } from 'unplugin'
import { build, mergeConfig, UserConfig } from 'vite'
import { swc } from './core/swc'
import { useViteDevServer } from './core/vite-server-adapter'
import { Options } from './types'

export async function buildServer(options?: Options | undefined): Promise<void> {
  const serverEntry = options?.serverEntry || path.join(cwd(), './backend/main.ts')
  const viteOptions = options?.viteOptions || {}

  await build(mergeConfig({
    build: {
      ssr: serverEntry,
      ssrManifest: true,
      outDir: 'dist/backend',
    },

    ssr: {
      noExternal: true,
    },

    plugins: [
      swc(),
    ],
  } as UserConfig, viteOptions))
}

export const unpluginFactory: UnpluginFactory<Options> = (options, meta) => {
  if (meta.framework !== 'vite') throw new Error(`[unplugin-rpc] Unsupported framework: ${meta.framework}, current only support vite.`)
  const watchDirs = options?.watchDirs || ['./backend/**/*']

  return {
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
      closeBundle() {
        if (options?.buildOnViteCloseBundle === true)
          buildServer(options).then(() => exit(0))
      },
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
