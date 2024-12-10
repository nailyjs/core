import type { InjectionToken } from '@nailyjs/ioc'
import type { RpcServerRequest } from '@nailyjs/rpc'
import { ipcRenderer } from 'electron'

export interface ElectronRpcClientReturn {
  request<T extends Record<string, any>>(injectionToken: string | symbol): RpcServerRequest<T>
}

export function createElectronClient(): ElectronRpcClientReturn {
  function request<T extends Record<string, any>>(injectionToken: InjectionToken): RpcServerRequest<T> {
    function createProxy(path: (string | symbol)[] = []): RpcServerRequest<T> {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      return new Proxy(async () => {}, {
        async apply(_target, thisArg, argArray) {
          const result = await ipcRenderer.invoke(injectionToken.toString(), {
            jsonrpc: '2.0',
            id: crypto.randomUUID(),
            method: `${injectionToken.toString()}.${path.join('.')}`,
            params: argArray,
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
