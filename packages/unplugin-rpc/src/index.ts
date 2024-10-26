import type { UnpluginFactory } from 'unplugin'
import type { ViteDevServer } from 'vite'
import type { Options } from './types'
import path from 'node:path'
import { cwd } from 'node:process'
import { createUnplugin } from 'unplugin'
import { ViteDevHttpAdapter } from './core/vite-server-adapter'

let __filename = globalThis.__filename
if (!__filename && import.meta.filename)
  __filename = import.meta.filename

async function runViteDevServer(options: Options, server: ViteDevServer): Promise<void> {
  const entryExport = options?.entryExport || 'app'
  const serverEntry = options?.serverEntry || path.join(cwd(), './backend/main.ts')

  await new ViteDevHttpAdapter(server, serverEntry, entryExport).runWithViteServer()
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
  const watchDirs = options?.watchDirs || ['./backend/**/*']

  return {
    name: 'unplugin-rpc',
    vite: {

      async configureServer(server) {
        await runViteDevServer(options || {}, server)
        server.watcher
          .add(watchDirs)
          .on('change', async () => {
            await server.restart()
          })
      },
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
