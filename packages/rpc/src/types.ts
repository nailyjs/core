export type ReturnTypePromisify<T extends (...args: any[]) => any> = T extends (...args: any[]) => Promise<any>
  ? T
  : (...args: Parameters<T>) => Promise<ReturnType<T>>

export type RpcServerRequest<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? ReturnTypePromisify<T[K]>
    : T[K] extends object
      ? RpcServerRequest<T[K]>
      : T[K]
}
