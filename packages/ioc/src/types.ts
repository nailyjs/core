import type { ICreateFilterParamDecoratorOnDecorateContext } from './filter-context'
import { ClassWrapper } from './wrappers'

export interface Class<T = any> {
  new (...args: any[]): T
}
export type InjectionToken = string | symbol | Class
export type Scope = 'singleton' | 'transient'
export type InjectableDecorate = 'Injectable' | 'Service' | 'Component' | 'Configuration'
export interface InjectableOptions {
  injectionToken: InjectionToken
  scope: Scope
  decorate: InjectableDecorate
}
export type ConfigurableInjectableOptions = Omit<InjectableOptions, 'decorate'>
export interface InjectOptions {
  injectionToken: InjectionToken
  optional: boolean
  parameterIndex: number | undefined
  propertyKey: string | symbol | undefined
}
export type CallType = 'parallel' | 'series'
export interface PostConstructMetadata {
  propertyKey: string | symbol
  callType: CallType
}
export interface FilterMetadata {
  errors: any[]
}
export interface FilterParamDecorate {
  readonly CurrentError: unique symbol
  readonly ErrorContext: unique symbol
}
export interface FilterExecutorContext {
  getMetadata(): ICreateFilterParamDecoratorOnDecorateContext
  getCurrentError(): any
}
export interface FilterParamExecutor {
  execute(context: FilterExecutorContext): any
}
export interface FilterParamMetadata {
  propertyKey: string | symbol
  parameterIndex: number
  decorate: keyof FilterParamDecorate
  args: any[]
  executor: Class<FilterParamExecutor>
}
export interface ErrorHandlerContextType {
  readonly ErrorHandlerContext: unique symbol
  readonly PostConstructCatchContext: unique symbol
}
export interface ErrorHandlerContext {
  contextType: keyof ErrorHandlerContextType
}
export interface ErrorHandler {
  catch(error: any, context: ErrorHandlerContext): any
}
export interface IPostConstructCatchContext extends ErrorHandlerContext {
  getClassWrapper(): ClassWrapper
  getCallType(): CallType
}
export interface PostConstructErrorHandler extends ErrorHandler {
  catch(error: any, context: IPostConstructCatchContext): any
}
