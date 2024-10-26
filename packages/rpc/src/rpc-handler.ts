import type { HandlerContext, HandlerRequest, HandlerResponse, SkipHandle } from '@nailyjs/backend'
import type { InjectableWrapper } from '@nailyjs/ioc'
import type { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { RpcHandlerContext } from './rpc-handler-context'
import { JsonRpcSchema } from './schema'

export class RpcHttpHandler extends RpcHandlerContext implements HandlerContext {
  constructor(private baseURL: string = '/') {
    super()
  }

  setBaseURL(baseURL: string): this {
    this.baseURL = baseURL
    return this
  }

  getBaseURL(): string {
    return this.baseURL
  }

  findRpcControllerWrapper(comparisonRpcId: string | symbol, comparisonMethodKey: string | symbol): Promise<InjectableWrapper | Response> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<InjectableWrapper | Response>(async (resolve) => {
      await this.eachRpcController((_target, key, wrapper, rpcId) => {
        if (key === comparisonMethodKey && comparisonRpcId === rpcId) resolve(wrapper)
      })
      resolve(new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: randomUUID(),
        error: {
          code: 404,
          message: 'Not Found',
          data: {
            cause: `Cannot find the rpc controller wrapper: ${comparisonRpcId.toString()}.${comparisonMethodKey.toString()}`,
          },
        },
      } as JsonRpcSchema.ResponseErrorSchema), {
        headers: {
          'Content-Type': 'application/json',
        },
      }))
    })
  }

  private jsonParse(body: string): Record<string, any> | Response {
    return JSON.parse(body)
  }

  private validateRequest(body: Record<string, any>): Response | Record<string, any> {
    try {
      return JsonRpcSchema.createRequestSchema().parse(body)
    }
    catch (error) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: randomUUID(),
        error: {
          code: 400,
          message: 'Request Schema Validation Error',
          data: (error as z.ZodError)?.format?.() || error,
        },
      } as JsonRpcSchema.ResponseErrorSchema), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  }

  async callback(request: HandlerRequest): Promise<HandlerResponse | typeof SkipHandle> {
    const pathname = new URL(request.url).pathname
    if (!pathname.startsWith(this.baseURL)) return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: randomUUID(),
      error: {
        code: 404,
        message: 'Not Found',
        data: {
          cause: `Cannot find the rpc server: ${pathname}`,
        },
      },
    } as JsonRpcSchema.ResponseErrorSchema), {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let error: unknown
    try {
      const bodyText = this.jsonParse(await request.text())
      if (bodyText instanceof Response) return bodyText
      const parsedBody = this.validateRequest(bodyText)
      if (parsedBody instanceof Response) return parsedBody
      const [rpcId, methodKey] = parsedBody.method.split('.')
      const wrapper = await this.findRpcControllerWrapper(rpcId, methodKey)
      if (wrapper instanceof Response) return wrapper
      const instance = wrapper.getOrCreateInstance()
      const finalResult = await instance[methodKey](...parsedBody.params)
      if (finalResult instanceof Response) return finalResult

      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: randomUUID(),
        result: finalResult,
      } as JsonRpcSchema.ResponseSuccessSchema), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    catch (err) {
      error = err
      return await this.catchError(err)
    }
    finally {
      await this.catchFinally(error)
    }
  }

  async catchError(error: unknown): Promise<HandlerResponse> {
    let errorHandled: any
    await this.eachErrorHandler(async (target, key) => {
      errorHandled = await target[key](error)
    }, error)
    if (errorHandled instanceof Response) return errorHandled
    else return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: randomUUID(),
      error: {
        code: 500,
        message: 'Internal Server Error',
        data: error,
      },
    } as JsonRpcSchema.ResponseErrorSchema), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async catchFinally(error: unknown): Promise<void> {
    await this.eachFinallyHandler(
      async (target, key) => await target[key](error),
      error,
    )
  }
}
