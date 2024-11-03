import { Class } from '@nailyjs/ioc'
import { RestfulControllerHandlerParameterWatermark } from '../constant'
import { Pipe } from '../decorators/pipe.decorator'
import { IHandlerRequest } from '../handler-request'
import { HandlerParamMetadata } from '../types'
import { SingleControllerHandlerWrapper } from '../wrappers/single-controller-handler-wrapper'
import { SingleParamMetadataWrapper } from '../wrappers/single-param-metadata-wrapper'
import { PipeContext } from './pipe-context'

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

  private sendResponse(response: any, post: boolean = false): Response {
    if (response instanceof Response) return response
    if (typeof response === 'string') return new Response(response)
    else if (typeof response === 'number' || typeof response === 'bigint' || typeof response === 'symbol' || typeof response === 'undefined' || typeof response === 'boolean')
      return new Response(String(response))
    else if (typeof response === 'object')
      return new Response(JSON.stringify(response), this.getDefaultResponseInit(post))
  }

  private async runPipes(value: any, pipeContext: PipeContext, pipes: Class[]): Promise<any> {
    for (const pipe of pipes) {
      const pipeInstance: Pipe = this.handler
        .getController()
        .getClassWrapper()
        .getGlobalContainer()
        .createClassWrapper(pipe)
        .save()
        .getClassFactory()
        .getOrCreateInstance()

      if (!pipeInstance.transform || typeof pipeInstance.transform !== 'function') continue
      const result = await pipeInstance.transform(value, pipeContext)
      if (result === undefined || result === null) continue
      value = result
    }
    return value
  }

  private async getParameters(propertyKey: string | symbol, request: IHandlerRequest): Promise<any[]> {
    const params = []
    const parameterMetadata: HandlerParamMetadata[] = this.handler
      .getController()
      .getClassWrapper()
      .getMetadata(RestfulControllerHandlerParameterWatermark) || []

    for (const metadata of parameterMetadata) {
      if (metadata.propertyKey !== propertyKey) continue
      if (metadata.pipes && Array.isArray(metadata.pipes) && metadata.pipes.length > 0) {
        const result = await this.runPipes(
          params[metadata.parameterIndex],
          new PipeContext(
            this.handler,
            new SingleParamMetadataWrapper(metadata),
            request,
          ),
          metadata.pipes,
        )
        if (result === undefined || result === null) continue
        params[metadata.parameterIndex] = result
      }
    }

    return params
  }

  async handle(request: IHandlerRequest): Promise<HandlerResponse> {
    if (!this.handler.isMatched(new URL(request.url).pathname))
      return new Response('Not Found', { status: 404 })
    const httpMethod = this.handler.getHttpMethod()
    if (httpMethod !== request.method) return new Response('Method Not Allowed', { status: 405 })
    const propertyKey = this.handler.getPropertyKey()

    if (!this.controllerInstance[propertyKey] || !this.isFunction(this.controllerInstance[propertyKey]))
      throw new Error(`Method ${String(propertyKey)} not found or not a function in controller instance.`)

    const response = await this.controllerInstance[propertyKey].bind(this.controllerInstance)(...(await this.getParameters(propertyKey, request)))
    return this.sendResponse(response, this.handler.getHttpMethod() === 'POST')
  }
}
