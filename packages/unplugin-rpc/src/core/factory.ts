import { RpcBootstrap } from '@nailyjs/rpc'

export type ViteRpcContextFn = (ctx: RpcBootstrap) => RpcBootstrap | Promise<RpcBootstrap>

export function ViteRpc(ctx?: ViteRpcContextFn): ViteRpcContextFn {
  return ctx || (ctx => ctx)
}
