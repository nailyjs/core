import { AbstractBootstrap, Autowired, Container, Service } from '@nailyjs/ioc'
import { createServer, type InlineConfig, mergeConfig } from 'vite'
import { EntryAnalyzerService } from '../entry-analyzer.service'
import { AbstractViteService } from './abstract-vite.service'
import { Compiler, ViteDevServer } from './compiler.protocol'

@Service()
export class ViteService extends AbstractViteService implements Compiler {
  @Autowired()
  private readonly entryAnalyzerService: EntryAnalyzerService

  // private async getViteModeNodeFromEntry(entry: string, server: ViteServer): Promise<ModuleNode> {
  //   return server.moduleGraph.getModuleById(entry)
  //     || server.moduleGraph.getModuleById(path.resolve(entry))
  //     || await server.moduleGraph.getModuleByUrl(entry)
  //     || Array.from(server.moduleGraph.getModulesByFile(path.resolve(entry)) || new Set<ModuleNode>())[0]
  //     || Array.from(server.moduleGraph.getModulesByFile(entry) || new Set<ModuleNode>())[0]
  // }

  async startPureBackendServer(config?: InlineConfig): Promise<void> {
    const viteServer = await createServer(mergeConfig(this.getPureBackendConfiguration(), config))
    super.watchNailyConfig(viteServer).watchInvalidateAll(viteServer)

    viteServer.middlewares.use(async (req, res, next) => {
      const entry = this.entryAnalyzerService.getEntry()
      if (entry.length === 0) throw new Error('Cannot find entry file, please specify in naily config file in "naily.cli.development".')
      const entryModule = await viteServer.ssrLoadModule(entry[0], { fixStacktrace: true })
      const app: AbstractBootstrap = entryModule[this.entryExport || 'app']
      const viteDevServer = app.getContainer().get(ViteDevServer) || new Container().getContainer().get(ViteDevServer)
      if (!viteDevServer) throw new Error('Cannot find ViteDevServer implementation.')
      if (viteDevServer.wrapperType !== 'class') throw new Error('ViteDevServer implementation must be a class.')
      const configuredViteDevServer = viteDevServer.getClassFactory().getOrCreateInstance<ViteDevServer>()
      await configuredViteDevServer.middleware({
        getBootstrap: () => app,
        getViteServer: () => viteServer,
        getRequest: () => req,
        getResponse: () => res,
      }, next)
    })

    await viteServer.listen()
    viteServer.printUrls()
    viteServer.bindCLIShortcuts({ print: true })
  }

  async setup(): Promise<void> {
    // const config = super.getConfiguration()

    // if (!this.rpcOptions) {
    //   const entry = this.entryAnalyzerService.getEntry()
    //   if (entry.length === 0) throw new Error('Cannot find entry file, please specify in naily config file in "naily.cli.development.vite.build.ssr".')

    //   if (!config.build) config.build = {}
    //   config.build.ssr = entry[0]
    //   if (!config.build.rollupOptions) config.build.rollupOptions = {}
    //   config.build.rollupOptions.input = entry[0]
    // }

    await this.startPureBackendServer()
  }
}
