import type { RpcBootstrap } from './rpc-bootstrap'

export interface RpcServerPlugin {
  name: string
  beforeRun?(bootstrap: RpcBootstrap<any>): any
  beforeListen?(bootstrap: RpcBootstrap<any>): any
  afterListen?(bootstrap: RpcBootstrap<any>): any
}
