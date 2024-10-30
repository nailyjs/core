import type { BackendPluginProtocol } from '@nailyjs/backend'
import type { RpcBootstrap } from './rpc-bootstrap'

export interface RpcServerPlugin extends BackendPluginProtocol {
  beforeRun?(bootstrap: RpcBootstrap<any>): any
  beforeListen?(bootstrap: RpcBootstrap<any>): any
  afterListen?(bootstrap: RpcBootstrap<any>): any
}
