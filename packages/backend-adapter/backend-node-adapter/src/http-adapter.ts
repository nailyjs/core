import type { HandlerContext } from '@nailyjs/backend'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import http from 'node:http'
import { AbstractHttpAdapter, SkipHandle } from '@nailyjs/backend'
import { sendResponse, transformIncomingMessageToRequest } from './utils'

export class NodeHttpAdapter extends AbstractHttpAdapter<Server> {
  private serverCallback: (req: http.IncomingMessage, res: http.ServerResponse) => any
  private readonly server: Server = http.createServer(async (req, res) => {
    if (!this.serverCallback) throw new Error('Server callback is not set, please call setupHandler() before listen the server.')
    return await this.serverCallback(req, res)
  })

  listen(port: number, callback?: (server: Server<typeof IncomingMessage, typeof ServerResponse<IncomingMessage>>) => any): Promise<Server<typeof IncomingMessage, typeof ServerResponse<IncomingMessage>>> {
    return new Promise<Server<typeof IncomingMessage, typeof ServerResponse<IncomingMessage>>>((resolve) => {
      this.server.listen(port, () => {
        if (callback) callback(this.server)
        resolve(this.server)
      })
    })
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.server.close((err) => {
        if (err) reject(err)
        else resolve()
      }),
    )
  }

  setupHandler(ctx: HandlerContext): void | Promise<void> {
    this.serverCallback = async (req, res) => {
      const request = await transformIncomingMessageToRequest(req).getRequest()
      const response = await ctx.callback(request)
      if (response === SkipHandle) return
      if (!response) return res.end()
      return await sendResponse(response, res).send()
    }
  }

  getInstance(): Server {
    return this.server
  }
}
