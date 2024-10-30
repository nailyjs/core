export interface Class<T = any> extends Function {
  new (...args: any[]): T
}

export type InjectionToken = string | symbol | Class
export type ScopeType = 'singleton' | 'transient'
