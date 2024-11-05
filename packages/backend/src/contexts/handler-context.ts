import { ErrorHandlerFactory } from '@nailyjs/ioc'
import { IHandlerRequest } from '../handler-request'
import { SingleControllerHandlerWrapper } from '../wrappers/single-controller-handler-wrapper'
import { RestFilterContext } from './filter-context'
import { ParamAnalyzer } from './param-analyzer'

export interface HandlerResponse extends Response {}

export interface IHandlerContext {
  handle(request: IHandlerRequest): Promise<HandlerResponse>
}

export class HandlerContext implements IHandlerContext {
  constructor(
    private readonly controllerInstance: Record<string | symbol, any>,
    private readonly handler: SingleControllerHandlerWrapper,
  ) {}

  private isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === 'function'
  }

  private getDefaultResponseInit(post: boolean = false): ResponseInit {
    if (post) {
      return {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 201,
        statusText: 'Created',
      }
    }
    return {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
      statusText: 'OK',
    }
  }

  private createParamAnalyzer(): ParamAnalyzer {
    return new ParamAnalyzer(this.handler)
  }

  private sendResponse(response: any, post: boolean = false): Response {
    if (response instanceof Response) return response
    if (typeof response === 'string') return new Response(response)
    else if (typeof response === 'number' || typeof response === 'bigint' || typeof response === 'symbol' || typeof response === 'undefined' || typeof response === 'boolean')
      return new Response(String(response))
    else if (typeof response === 'object')
      return new Response(JSON.stringify(response), this.getDefaultResponseInit(post))
  }

  async handle(request: IHandlerRequest): Promise<HandlerResponse> {
    try {
      if (!this.handler.isMatched(new URL(request.url).pathname))
        return new Response('Not Found', { status: 404 })
      const httpMethod = this.handler.getHttpMethod()
      if (httpMethod !== request.method) return new Response('Method Not Allowed', { status: 405 })
      const propertyKey = this.handler.getPropertyKey()

      if (!this.controllerInstance[propertyKey] || !this.isFunction(this.controllerInstance[propertyKey]))
        throw new Error(`Method ${String(propertyKey)} not found or not a function in controller instance.`)

      const paramAnalyzer = this.createParamAnalyzer()
      const parameters = await paramAnalyzer.getParameters(propertyKey, request)
      const response = await this.controllerInstance[propertyKey].bind(this.controllerInstance)(...parameters)
      return this.sendResponse(response, this.handler.getHttpMethod() === 'POST')
    }
    catch (error) {
      const filterContext = new RestFilterContext(request)
      await new ErrorHandlerFactory().catch(error, filterContext)
      const response = filterContext.getResponse()
      if (!response) return new Response('Internal Server Error', { status: 500 })
      return response
    }
  }
}
