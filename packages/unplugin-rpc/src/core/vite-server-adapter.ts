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

  setupHandler(ctx: RpcHttpHandler): void | Promise<void> {
    this.viteServer.middlewares.use(async (req, res, next) => {
      // 不是 POST 请求则跳过
      if (req.method !== 'POST')
        return next()

      // 加载服务端入口模块
      const mod = await this.viteServer.ssrLoadModule(this.serverEntry, { fixStacktrace: true })
      if (!(this.entryExport in mod) || typeof mod[this.entryExport] !== 'object')
        throw new Error(`Cannot find export "${this.entryExport}" in ${this.serverEntry}`)
      const app: RpcBootstrap<any> = mod[this.entryExport]

      // 设置基础 URL
      const baseURL = app.getBaseURL()
      ctx.setBaseURL(baseURL)
      if (!req.url?.startsWith(ctx.getBaseURL()))
        return next()

      // 设置请求处理器
      const adapter = app.getBackendAdapter()
      ctx.getInjectableContainer = adapter.getInjectableContainer
      ctx.getInjectContainer = adapter.getInjectContainer
      ctx.getInjectableTarget = adapter.getInjectableTarget
      ctx.hasInjectableTarget = adapter.hasInjectableTarget

      // 执行请求处理器
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
    const handler = new RpcHttpHandler()
    await this.setupHandler(handler)
  }
}
