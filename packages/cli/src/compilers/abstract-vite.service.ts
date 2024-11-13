import path from 'node:path'
import { Value } from '@nailyjs/config'
import { Injectable } from '@nailyjs/ioc'
import NailyRpc, { swc } from 'unplugin-rpc'
import { Options } from 'unplugin-rpc/types'
import { mergeConfig, type UserConfig, type ViteDevServer } from 'vite'

@Injectable()
export abstract class AbstractViteService {
  @Value('naily.cli.development.vite')
  protected readonly viteConfig: UserConfig

  @Value('naily.cli.development.entryExport')
  protected readonly entryExport: string

  @Value('naily.cli.development.serverEntry')
  protected readonly serverEntry: string

  refreshScreen(): void {
    if ((this.viteConfig || {}).clearScreen !== false) console.clear()
  }

  getBaseConfiguration(): UserConfig {
    return mergeConfig({
      esbuild: false,
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
      ],
    } as UserConfig, this.viteConfig)
  }

  @Value('naily.cli.development.rpc')
  protected readonly rpcOptions: false | Omit<Options, 'build' | 'entryExport' | 'serverEntry'>

  getRpcConfiguration(): UserConfig {
    return mergeConfig(this.getBaseConfiguration(), {
      plugins: [
        NailyRpc.vite({
          ...this.rpcOptions,
          entryExport: this.entryExport || 'app',
          serverEntry: this.serverEntry,
        }),
      ],
    } as UserConfig)
  }

  getPureBackendConfiguration(): UserConfig {
    return mergeConfig(this.getBaseConfiguration(), {
      appType: 'custom',
    } as UserConfig)
  }

  getConfiguration(): UserConfig {
    return this.rpcOptions
      ? this.getRpcConfiguration()
      : this.getPureBackendConfiguration()
  }

  watchNailyConfig(viteServer: ViteDevServer): this {
    viteServer.watcher.add(path.resolve('naily.config.ts')).on('all', (_ev, filePath) => {
      if (filePath === path.resolve('naily.config.ts')) {
        viteServer.restart(true)
        this.refreshScreen()
        console.log('naily.config.ts changed, restarting...')
      }
    })
    return this
  }

  watchInvalidateAll(viteServer: ViteDevServer): this {
    viteServer.watcher.on('all', () => viteServer.moduleGraph.invalidateAll())
    return this
  }
}
