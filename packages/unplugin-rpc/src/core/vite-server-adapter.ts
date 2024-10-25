import type { HandlerContext } from '@nailyjs/backend'
import type { ViteDevServer } from 'vite'
import { AbstractHttpAdapter, SkipHandle } from '@nailyjs/backend'
import { sendResponse, transformIncomingMessageToRequest } from '@nailyjs/backend/utils'
import { type RpcBootstrap, RpcHttpHandler } from '@nailyjs/rpc'

export class ViteDevHttpAdapter extends AbstractHttpAdapter {
  constructor(
    private readonly viteServer: ViteDevServer,
    private readonly serverEntry: string,
    private readonly entryExport: string,
    private readonly devBaseURL: string = '/api',
  ) {
    super()
  }

  async listen(port: number, callback?: () => any): Promise<void> {
    await this.viteServer.listen(port)
      .then(callback)
  }

  async close(): Promise<void> {
    return this.viteServer.close()
  }

  setupHandler(ctx: HandlerContext): void | Promise<void> {
    this.viteServer.middlewares.use(async (req, res, next) => {
      if (req.method !== 'POST')
        return next()

      const mod = await this.viteServer.ssrLoadModule(this.serverEntry, { fixStacktrace: true })

      if (!(this.entryExport in mod) || typeof mod[this.entryExport] !== 'object')
        throw new Error(`Cannot find export "${this.entryExport}" in ${this.serverEntry}`)
      const app: RpcBootstrap<any> = mod[this.entryExport]
      const baseURL = app.getBaseURL()
      if (!req.url?.startsWith(baseURL))
        return next()
      const adapter = app.getBackendAdapter()
      ctx.getInjectableContainer = adapter.getInjectableContainer
      ctx.getInjectContainer = adapter.getInjectContainer
      ctx.getInjectableTarget = adapter.getInjectableTarget
      ctx.hasInjectableTarget = adapter.hasInjectableTarget
      await adapter.setupHandler(ctx)

      const request = await transformIncomingMessageToRequest(req).getRequest()
      const response = await ctx.callback(request)
      if (response === SkipHandle)
        return next()
      return await sendResponse(response, res).send()
    })
  }

  getInstance(): ViteDevServer {
    return this.viteServer
  }

  async runWithViteServer(): Promise<void> {
    const handler = new RpcHttpHandler(this.devBaseURL)
    await this.setupHandler(handler)
  }
}
