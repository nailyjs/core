import type { PluginProtocol } from '@nailyjs/ioc'
import type { RpcBootstrap } from './rpc-bootstrap'

export interface RpcServerPlugin extends PluginProtocol {
  name: string
  beforeRun?(bootstrap: RpcBootstrap<any>): any
  beforeListen?(bootstrap: RpcBootstrap<any>): any
  afterListen?(bootstrap: RpcBootstrap<any>): any
}
