export interface Class<T = any> {
  new (...args: any[]): T
}
export type InjectionToken = string | symbol | Class
export type Scope = 'singleton' | 'transient'
export interface InjectableOptions {
  injectionToken: InjectionToken
  scope: Scope
}
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
