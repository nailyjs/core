import type { AbstractBootstrap } from './abstract-bootstrap'

export interface PluginProtocol {
  name: string
  install(bootstrap: AbstractBootstrap): any
}
