import type { Class, Container, ErrorHandler, InjectableOptions, IocPlugin } from '@nailyjs/ioc'
import type { IHandlerContext } from './contexts/handler-context'
import { RestFilterContext } from './contexts'

export interface ControllerOptions extends Partial<InjectableOptions> {
  prefix: string
}
export type ValueOf<T> = T[keyof T]
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'ALL'
export interface ControllerHandlerOptions {
  path: string
  propertyKey: string | symbol
  method: HttpMethod
}
export interface IBackendAdapter {
  listen(port: number, callback: () => void): Promise<void>
  setupHandle(handlerContext: IHandlerContext): void | Promise<void>
}
export interface HandlerParamDecorate {
  readonly Params: unique symbol
  readonly Query: unique symbol
  readonly Header: unique symbol
  readonly Cookies: unique symbol
  readonly Req: unique symbol
  readonly Ip: unique symbol
  readonly Session: unique symbol

  readonly Body: unique symbol
  readonly BodyJson: unique symbol
  readonly BodyFormData: unique symbol
  readonly BodyText: unique symbol
  readonly BodyArrayBuffer: unique symbol
}
export interface HandlerParamMetadata {
  decorate: keyof HandlerParamDecorate
  parameterIndex: number
  propertyKey: string | symbol
  pipes?: Class[]
  infer?: string
}
export interface RestErrorHandler extends ErrorHandler {
  catch(error: any, ctx: RestFilterContext): any
}
export interface BackendPlugin extends IocPlugin {
  beforeHandle?(handlerContext: Request, container: Container): void | Promise<void> | Promise<Response> | Response
}
