import type { PluginProtocol } from '@nailyjs/ioc'
import type { BackendBootstrap } from './backend-bootstrap'

export interface BackendPluginProtocol extends PluginProtocol {
  install(bootstrap: BackendBootstrap): any
}
