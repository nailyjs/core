import path from 'node:path'
import { cwd } from 'node:process'
import { HandlerRequest, IBackendAdapter } from '@nailyjs/backend'
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

  setupHandle(): void {
    this.server.middlewares.use(async (req, res, next) => {
      const bootstrap = await this.loadEntryModule()
      await bootstrap.getPluginRunner().runBeforeRun()

      if (req.method === 'GET')
        return next()
      if (!req.url.startsWith(bootstrap.getBaseURL()))
        return next()

      // 每次请求都重新实例化 RpcHandlerContext
      const handlerContext = this.createContext(bootstrap)
      const request = await transformIncomingMessageToRequest(req).getRequest()
      const response = await handlerContext.handle(request as HandlerRequest)
      return await sendResponse(response, res).send()
    })
  }

  private createContext(container: Container): RpcHandlerContext {
    const controllerScanner = new RpcControllerScanner(container)
    return new RpcHandlerContext(controllerScanner.getRpcControllerWrapper())
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
      new ViteDevHttpAdapter(server, serverEntry, entryExport).setupHandle()
      return ctx
    },
  }
  return ctx
}
