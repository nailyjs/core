import { randomUUID } from 'node:crypto'
import { HandlerRequest, IHandlerContext } from '@nailyjs/backend'
import { ErrorHandlerFactory } from '@nailyjs/ioc'
import { get } from 'lodash-es'
import { RpcFilterContext } from './filter-context'
import { SingleRpcControllerWrapper } from './single-rpc-controller-wrapper'

export class RpcHandlerContext implements IHandlerContext {
  constructor(private readonly controllers: SingleRpcControllerWrapper[]) {}

  handle404(): Response {
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: 404,
        message: 'Method not found',
      },
      id: randomUUID(),
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  handleInternalError(): Response {
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: 500,
        message: 'Internal server error',
      },
      id: randomUUID(),
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async getJsonBody(request: HandlerRequest): Promise<any> {
    try {
      return await request.json() || {}
    }
    catch (error) {
      ;(() => error)()
      return {}
    }
  }

  // JSON-RPC 2.0
  async handle(request: HandlerRequest): Promise<Response> {
    try {
      const body = await this.getJsonBody(request)
      const [token, ...key] = ((body.method || '') as string).split('.')

      const controller = this.controllers.find(controller => controller.getInjectionToken() === token)
      if (!controller) return this.handle404()
      const controllerInstance = controller
        .getClassWrapper()
        .getClassFactory()
        .getOrCreateInstance()

      const methodFunc: (...args: any[]) => any = get(controllerInstance, key)
      if (!methodFunc || typeof methodFunc !== 'function')
        return this.handle404()

      let params = body.params || []
      if (typeof params !== 'object') return this.handle404()
      if (!Array.isArray(params)) params = Object.values(params)
      const response = await methodFunc.bind(controllerInstance)(...params)
      if (response instanceof Response) return response

      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        result: response,
        id: randomUUID(),
      }), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    catch (error) {
      const ctx = new RpcFilterContext()
      await new ErrorHandlerFactory().catch(error, ctx)
      const response = ctx.getResponse()
      if (!response) return this.handleInternalError()
      return response
    }
  }
}
