import path from 'node:path'
import { cwd } from 'node:process'
import { Value } from '@nailyjs/config'
import { Service } from '@nailyjs/ioc'
import { hmrLogger, swc, useViteDevServer } from 'unplugin-rpc'
import { Options } from 'unplugin-rpc/types'
import { createFilter, createServer, type UserConfig } from 'vite'
import { Compiler } from './compiler.protocol'

@Service()
export class ViteService implements Compiler {
  @Value('naily.cli.development.vite')
  private readonly _viteConfig: UserConfig

  @Value('naily.cli.development.rpc')
  private readonly rpcOptions: false | Omit<Options, 'build'>

  refreshScreen(): void {
    if ((this._viteConfig || {}).clearScreen !== false)
      console.clear()
  }

  async setup(): Promise<void> {
    const viteServer = await createServer({
      server: {
        host: '0.0.0.0',
      },
      plugins: [
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

        {
          name: 'naily:rpc',
          configureServer: async (server) => {
            if (this.rpcOptions) await useViteDevServer(this.rpcOptions, server).run()
          },

          handleHotUpdate: (ctx) => {
            if (this.rpcOptions === false) return
            const moduleFilePaths = ctx.modules.map(mod => mod.file)
            // 过滤掉空文件
              .filter(file => file)
            // 过滤掉不在 watchDirs 中的文件
              .filter(file => createFilter((this.rpcOptions as Omit<Options<string>, 'build'>).watchDirs || ['./backend/**/*'])(file)) as string[]

            if (moduleFilePaths.length === 0)
              return

            ctx.server.moduleGraph.invalidateAll()
            ctx.server.ws.send({ type: 'full-reload' })
            if (ctx.server.config.clearScreen !== false) console.clear()
            hmrLogger(moduleFilePaths.map(file => path.isAbsolute(file) ? path.relative(cwd(), file) : file))
            return []
          },
        },
      ],
    })
    viteServer.watcher.add(path.join(cwd(), 'naily.config.ts')).on('all', (_ev, filePath) => {
      if (filePath === path.join(cwd(), 'naily.config.ts')) {
        this.refreshScreen()
        console.log('naily.config.ts changed, restarting...')
        viteServer.restart(true)
      }
    })

    await viteServer.listen()
    viteServer.printUrls()
    viteServer.bindCLIShortcuts({ print: true })
  }
}
