import type { InjectableWrapper } from '@nailyjs/ioc'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { BackendBootstrap } from '../backend-bootstrap'
import { RestControllerSymbol } from '../constant'
import { HandlerContext } from '../handler-context'
import { NodeHttpAdapter } from './http-adapter'

export class NodeBootstrap extends BackendBootstrap<NodeHttpAdapter> {
  constructor() {
    super(new NodeHttpAdapter())
  }

  private wrapperIsController(wrapper: InjectableWrapper): boolean {
    return !wrapper.isFilter()
      && wrapper.isInjectable()
      && Reflect.hasMetadata(RestControllerSymbol, wrapper.getTarget())
  }

  private isCalledInit: boolean = false
  init(): this {
    if (this.isCalledInit) return this
    this.getInjectableContainer().forEach((wrapper) => {
      if (!this.wrapperIsController(wrapper)) return
      return wrapper.getOrCreateInstance()
    })
    return this
  }

  async run(port: number, callback?: (server: Server<typeof IncomingMessage, typeof ServerResponse<IncomingMessage>>) => any): Promise<Server<typeof IncomingMessage, typeof ServerResponse<IncomingMessage>>> {
    if (!this.isCalledInit) this.init()
    const adapter = this.getBackendAdapter()
    await adapter.setupHandler(new HandlerContext())

    return new Promise<Server<typeof IncomingMessage, typeof ServerResponse<IncomingMessage>>>((resolve) => {
      adapter.listen(port, async (server) => {
        if (callback) await callback(server)
        resolve(server)
      })
    })
  }
}
