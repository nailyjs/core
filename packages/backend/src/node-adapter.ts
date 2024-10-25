import type { Server } from 'node:http'
import type { HandlerContext } from './handler-context'
import http from 'node:http'
import { AbstractHttpAdapter } from './backend-adapter'
import { SkipHandle } from './constant'
import { sendResponse, transformIncomingMessageToRequest } from './utils'

export class NodeHttpAdapter extends AbstractHttpAdapter<Server> {
  private readonly server = http.createServer()

  listen(port: number, callback?: () => any): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        if (callback) callback()
        resolve()
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
    this.server.on('request', async (req, res) => {
      const request = await transformIncomingMessageToRequest(req).getRequest()
      const response = await ctx.callback(request)
      if (response === SkipHandle) return
      return await sendResponse(response, res).send()
    })
  }

  getInstance(): Server {
    return this.server
  }
}
