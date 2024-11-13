import type { BackendPlugin, HandlerRequest } from '@nailyjs/backend'
import type { ServerResponse } from 'node:http'
import type { Connect, PreviewServer, ViteDevServer } from 'vite'
import type { Options } from '../types'
import path from 'node:path'
import { cwd } from 'node:process'
import { sendResponse, transformIncomingMessageToRequest } from '@nailyjs/backend/node-adapter'
import { RpcBootstrap, RpcHandlerContext } from '@nailyjs/rpc'
import { EntityMetadataNotFoundError } from 'typeorm'

interface ViteDevServerReturn {
  run(): Promise<this>
  init(
    bootstrap: RpcBootstrap,
    req: Connect.IncomingMessage,
    res: ServerResponse
  ): Promise<any>
}

export function useViteDevServer(options: Options, server: ViteDevServer | PreviewServer): ViteDevServerReturn {
  const entryExport = options?.entryExport || 'app'
  const serverEntry = options?.serverEntry || path.join(cwd(), './backend/main.ts')

  const ctx: ViteDevServerReturn = {
    async init(bootstrap, req, res): Promise<any> {
      const pluginRunner = bootstrap.getPluginRunner()
      await pluginRunner.runBeforeRun()
      const pluginContainer = pluginRunner.getPluginContainer() as readonly BackendPlugin[]

      // 每次请求都重新实例化 RpcHandlerContext
      const request = await transformIncomingMessageToRequest(req).getRequest()

      const handlerContext = new RpcHandlerContext(bootstrap.getRpcControllerScanner().getRpcControllerWrapper())
      for (const plugin of pluginContainer) {
        if (plugin.beforeHandle && typeof plugin.beforeHandle === 'function') {
          const result = await plugin.beforeHandle(request, bootstrap)
          if (result instanceof Response) return await sendResponse(result, res).send()
        }
      }
      try {
        const response = await handlerContext.handle(request as HandlerRequest)
        return await sendResponse(response, res).send()
      }
      catch (e) {
        // EntityMetadataNotFoundError 这个错误会在每次修改实体类后触发，这里直接重启服务
        // 目前暂无法修复这个问题，如果有人知道如何修复，欢迎 PR
        if (!(e instanceof EntityMetadataNotFoundError))
          console.error(e)

        if ((server as ViteDevServer).restart && typeof (server as ViteDevServer).restart === 'function')
          await (server as ViteDevServer).restart(true)
      }
    },

    async run(): Promise<ViteDevServerReturn> {
      server.middlewares.use(async (req, res, next) => {
        const mod = await (server as ViteDevServer).ssrLoadModule(serverEntry)
        if (!(entryExport in mod) || typeof mod[entryExport] !== 'object')
          throw new Error(`Cannot find export "${entryExport}" in ${serverEntry}`)
        const bootstrap: RpcBootstrap = mod[entryExport]

        if (req.method === 'GET')
          return next()
        if (!req.url.startsWith(bootstrap.getBaseURL()))
          return next()

        const pluginRunner = bootstrap.getPluginRunner()
        await pluginRunner.runBeforeRun()
        const pluginContainer = pluginRunner.getPluginContainer() as readonly BackendPlugin[]

        // 每次请求都重新实例化 RpcHandlerContext
        const request = await transformIncomingMessageToRequest(req).getRequest()

        const handlerContext = new RpcHandlerContext(bootstrap.getRpcControllerScanner().getRpcControllerWrapper())
        for (const plugin of pluginContainer) {
          if (plugin.beforeHandle && typeof plugin.beforeHandle === 'function') {
            const result = await plugin.beforeHandle(request, bootstrap)
            if (result instanceof Response) return await sendResponse(result, res).send()
          }
        }
        try {
          const response = await handlerContext.handle(request as HandlerRequest)
          return await sendResponse(response, res).send()
        }
        catch (e) {
          // EntityMetadataNotFoundError 这个错误会在每次修改实体类后触发，这里直接重启服务
          // 目前暂无法修复这个问题，如果有人知道如何修复，欢迎 PR
          if (!(e instanceof EntityMetadataNotFoundError))
            console.error(e)

          if ((server as ViteDevServer).restart && typeof (server as ViteDevServer).restart === 'function') {
            (server as ViteDevServer).moduleGraph.invalidateAll()
            await (server as ViteDevServer).restart(true);
            (server as ViteDevServer).moduleGraph.invalidateAll()
          }
        }
      })
      return this
    },
  }
  return ctx
}
