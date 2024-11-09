import path from 'node:path'
import { cwd } from 'node:process'
import { IBackendAdapter, IHandlerContext } from '@nailyjs/backend'
import { sendResponse, transformIncomingMessageToRequest } from '@nailyjs/backend/node-adapter'
import { Container } from '@nailyjs/ioc'
import { RpcBootstrap, RpcControllerScanner, RpcHandlerContext } from '@nailyjs/rpc'
import { ViteDevServer } from 'vite'
import { Options } from '../types'

class ViteDevHttpAdapter implements IBackendAdapter {
  constructor(
    private readonly server: ViteDevServer,
    private readonly serverEntry: string,
    private readonly entryExport: string,
  ) {}

  async listen(port: number, callback: () => void): Promise<void> {
    return this.server.listen(port).then(callback)
  }

  private async loadEntryModule(): Promise<RpcBootstrap> {
    const mod = await this.server.ssrLoadModule(this.serverEntry)
    if (!(this.entryExport in mod) || typeof mod[this.entryExport] !== 'object')
      throw new Error(`Cannot find export "${this.entryExport}" in ${this.serverEntry}`)
    return mod[this.entryExport] as RpcBootstrap
  }

  private container = new Container()

  setupHandle(handlerContext: IHandlerContext): void {
    this.server.middlewares.use(async (req, res, next) => {
      const bootstrap = await this.loadEntryModule()
      await bootstrap.getPluginRunner().runBeforeRun()
      this.container.replaceContainer(bootstrap.getContainer())

      if (req.method === 'GET')
        return next()
      if (!req.url.startsWith(bootstrap.getBaseURL()))
        return next()

      // 每次请求都重新实例化 RpcHandlerContext
      handlerContext = new RpcHandlerContext(new RpcControllerScanner(this.container).getRpcControllerWrapper())
      const request = await transformIncomingMessageToRequest(req).getRequest()
      const response = await handlerContext.handle(request)
      return await sendResponse(response, res).send()
    })
  }

  async runWithViteServer(): Promise<void> {
    const controllerScanner = new RpcControllerScanner(this.container)
    // 第一次启动时，需要手动调用 setupHandle 来设置 handler
    const context = new RpcHandlerContext(controllerScanner.getRpcControllerWrapper())
    this.setupHandle(context)
  }
}

interface ViteDevServerReturn {
  run(): Promise<this>
}

export function useViteDevServer(options: Options, server: ViteDevServer): ViteDevServerReturn {
  const entryExport = options?.entryExport || 'app'
  const serverEntry = options?.serverEntry || path.join(cwd(), './backend/main.ts')

  const ctx: ViteDevServerReturn = {
    async run(): Promise<ViteDevServerReturn> {
      await new ViteDevHttpAdapter(server, serverEntry, entryExport).runWithViteServer()
      return ctx
    },
  }
  return ctx
}
