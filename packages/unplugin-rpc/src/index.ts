import type { UnpluginFactory } from 'unplugin'
import type { UserConfig, ViteDevServer } from 'vite'
import type { Options } from './types'
import path from 'node:path'
import { cwd, exit } from 'node:process'
import { createFilter } from '@rollup/pluginutils'
import { createUnplugin } from 'unplugin'
import { build, mergeConfig } from 'vite'
import { hmrLogger } from './core/hmr-logger'
import { swc } from './core/swc'
import { ViteDevHttpAdapter } from './core/vite-server-adapter'

let __filename = globalThis.__filename
if (!__filename && import.meta.filename)
  __filename = import.meta.filename

async function runViteDevServer(options: Options, server: ViteDevServer): Promise<void> {
  const entryExport = options?.entryExport || 'app'
  const serverEntry = options?.serverEntry || path.join(cwd(), './backend/main.ts')

  await new ViteDevHttpAdapter(server, serverEntry, entryExport).runWithViteServer()
}

export function buildServer(options?: Options | undefined): void {
  const serverEntry = options?.serverEntry || path.join(cwd(), './backend/main.ts')
  const viteOptions = options?.viteOptions || {}

  build(mergeConfig({
    build: {
      ssr: serverEntry,
      ssrManifest: true,
      outDir: 'dist/backend',
    },

    plugins: [
      swc(),
    ],
  } as UserConfig, viteOptions)).then(() => exit(0))
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
  const watchDirs = options?.watchDirs || ['./backend/**/*']

  return {
    name: 'unplugin-rpc',

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
        await runViteDevServer(options || {}, server)
        server.watcher
          .add(watchDirs)
          .on('change', async (filePath) => {
            const isWatchedFile = createFilter(watchDirs)(filePath)
            if (!isWatchedFile)
              return
            await runViteDevServer(options || {}, server)
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
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
