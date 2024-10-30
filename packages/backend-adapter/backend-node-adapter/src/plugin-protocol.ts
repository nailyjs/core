import type { BackendPluginProtocol } from '@nailyjs/backend'
import type { NodeBootstrap } from './node-bootstrap'

export interface NodePluginProtocol extends BackendPluginProtocol {
  install(bootstrap: NodeBootstrap): any
}
