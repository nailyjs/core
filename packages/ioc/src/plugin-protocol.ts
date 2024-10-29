import type { Container } from './container'

export interface PluginProtocol {
  install(bootstrap: Container): any
}
