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
  const devBaseURL = options?.devBaseURL || '/rpc'

  await new ViteDevHttpAdapter(server, serverEntry, entryExport, devBaseURL).runWithViteServer()
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
  const serverEntry = options?.serverEntry || path.join(cwd(), './backend/main.ts')

  return {
    name: 'unplugin-rpc',
    vite: {
      async configureServer(server) {
        await runViteDevServer(options || {}, server)
        server.watcher.on('change', async (filePath) => {
          if (path.resolve(filePath) === path.resolve(serverEntry)) await server.restart()
        })
      },
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin
