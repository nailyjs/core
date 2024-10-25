import type { AxiosInstance } from 'axios'
import type { z } from 'zod'
import type { RpcServerRequest } from './types'
import axios from 'axios'
import { JsonRpcSchema } from './schema'

export interface RpcClientReturn {
  request<T extends Record<string, any>>(symbol: string | symbol, paramSchema?: z.ZodTuple): RpcServerRequest<T>
}

export function createRpcClient(url?: string): RpcClientReturn
export function createRpcClient(axiosInstance: AxiosInstance): RpcClientReturn
export function createRpcClient(urlOrAxiosInstance: AxiosInstance | string = '/rpc'): RpcClientReturn {
  function request<T extends Record<string, (...args: any[]) => any>>(symbol: string | symbol, paramSchema?: z.ZodTuple): RpcServerRequest<T> {
    return new Proxy({}, {
      get(_, p) {
        return async function (...args: any[]) {
          const result = await (typeof urlOrAxiosInstance === 'object' ? urlOrAxiosInstance : axios)({
            method: 'POST',
            url: typeof urlOrAxiosInstance === 'string' ? urlOrAxiosInstance : '/rpc',
            headers: {
              'Content-Type': 'application/json',
            },
            data: JsonRpcSchema.createRequestSchema(paramSchema).parse({
              jsonrpc: '2.0',
              id: crypto.randomUUID(),
              method: `${symbol.toString()}.${p.toString()}`,
              params: args,
            } as JsonRpcSchema.RequestSchema),
          })
          return result.data.result
        }
      },
    }) as RpcServerRequest<T>
  }

  return {
    request,
  }
}
