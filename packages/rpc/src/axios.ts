import type { AxiosInstance } from 'axios'
import type { RpcServerRequest } from './types'
import axios from 'axios'
import { randomUUID } from './utils'

export interface AxiosRpcClientReturn {
  request<T extends Record<string, any>>(injectionToken: string | symbol): RpcServerRequest<T>
}

export interface AxiosClientOptions {
  urlOrAxiosInstance?: AxiosInstance | string
  ssr?: boolean
}

export function createEmptyReadonlyProxy(): Record<any, any> {
  return new Proxy(() => {}, {
    get() {
      return createEmptyReadonlyProxy()
    },
    apply() {
      return createEmptyReadonlyProxy()
    },
    construct() {
      return createEmptyReadonlyProxy()
    },
  })
}

export function createAxiosClient({ urlOrAxiosInstance = '/', ssr = true }: AxiosClientOptions): AxiosRpcClientReturn {
  function request<T extends Record<string, (...args: any[]) => any>>(symbol: string | symbol): RpcServerRequest<T> {
    function createProxy(path: (string | symbol)[] = []): RpcServerRequest<T> {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      return new Proxy(async () => {}, {
        async apply(target, thisArg, argArray) {
          // If not in client environment, return a dummy async function
          if (ssr === true) return createEmptyReadonlyProxy()

          const result = await (typeof urlOrAxiosInstance === 'object' ? urlOrAxiosInstance : axios)({
            method: 'POST',
            url: typeof urlOrAxiosInstance === 'string' ? urlOrAxiosInstance : '/',
            headers: {
              'Content-Type': 'application/json',
            },
            data: {
              jsonrpc: '2.0',
              id: randomUUID(),
              method: `${symbol.toString()}.${path.join('.')}`,
              params: argArray,
            },
          })

          return result.data.result
        },

        get(_, prop) {
          return createProxy([...path, prop])
        },
      }) as RpcServerRequest<T>
    }

    return createProxy()
  }

  return {
    request,
  }
}
