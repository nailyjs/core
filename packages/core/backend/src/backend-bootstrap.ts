import type { AbstractHttpAdapter } from './backend-adapter'
import type { BackendPluginProtocol } from './plugin-protocol'
import { AbstractBootstrap } from '@nailyjs/ioc'

export abstract class BackendBootstrap<Adapter extends AbstractHttpAdapter = AbstractHttpAdapter> extends AbstractBootstrap {
  constructor(
    private backendAdapter: Adapter,
  ) { super() }

  /**
   * ### Get current backend adapter.
   *
   * @return {Adapter} The backend adapter.
   * @memberof BackendBootstrap
   */
  getBackendAdapter(): Adapter {
    return this.backendAdapter
  }

  /**
   * ### Set the backend adapter.
   *
   * The backend adapter should be an instance of `AbstractHttpAdapter`.
   *
   * @param {Adapter} backendAdapter The backend adapter.
   * @return {this}
   * @memberof BackendBootstrap
   */
  setBackendAdapter(backendAdapter: Adapter): this {
    this.backendAdapter = backendAdapter
    return this
  }

  use(plugin: BackendPluginProtocol | BackendPluginProtocol[]): Promise<this> {
    return super.use(plugin)
  }
}
