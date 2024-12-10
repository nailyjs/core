import type { IBackendAdapter } from '../../src'
import http from 'node:http'
import { IHandlerContext } from '../../src/contexts/handler-context'
import * as transformer from './transform'

export class NodeAdapter implements IBackendAdapter {
  private handler: (req: http.IncomingMessage, res: http.ServerResponse) => any
  private server: http.Server

  getHandler(): (req: http.IncomingMessage, res: http.ServerResponse) => any {
    return this.handler
  }

  setupHandle(ctx: IHandlerContext): void | Promise<void> {
    this.handler = async (req, res) => {
      const request = await transformer.transformIncomingMessageToRequest(req).getRequest()
      const response = await ctx.handle(request)
      if (!response) return res.end()
      return await transformer.sendResponse(response, res).send()
    }
  }

  listen(port: number, callback: () => void): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server = http.createServer(async (req, res) => {
        if (!this.handler) return res.end('No handler')
        return await this.handler(req, res)
      })
      this.server.listen(port, () => {
        if (callback) callback()
        resolve()
      })
    })
  }
}
