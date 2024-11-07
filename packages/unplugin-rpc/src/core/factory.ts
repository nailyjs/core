import { RpcBootstrap } from '@nailyjs/rpc'

export type ViteRpcContextFn = (ctx: RpcBootstrap) => void | Promise<void>

export function ViteRpc(ctx?: ViteRpcContextFn): ViteRpcContextFn {
  return ctx || (() => {})
}
