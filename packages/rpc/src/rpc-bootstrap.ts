import type { AbstractHttpAdapter } from '@nailyjs/backend'
import type { RpcServerPlugin } from './rpc-plugin-protocol'
import { BackendBootstrap } from '@nailyjs/backend'
import { RpcHttpHandler } from './rpc-handler'

export class RpcBootstrap<Adapter> extends BackendBootstrap {
  constructor(backendAdapter: AbstractHttpAdapter<Adapter>) {
    super(backendAdapter)
  }

  private _baseURL: string = '/'
  /**
   * ### Set the base URL of the rpc server.
   *
   * The default value is `/`.
   *
   * @template BaseURL The base URL of the rpc server.
   * @param {BaseURL} baseURL The base URL of the rpc server.
   * @return {this}
   * @memberof RpcBootstrap
   */
  setBaseURL<BaseURL extends string>(baseURL: BaseURL): this {
    this._baseURL = baseURL
    return this
  }

  /**
   * ### Get the base URL of the rpc server.
   *
   * The default value is `/`.
   *
   * @return {string} The base URL of the rpc server.
   * @memberof RpcBootstrap
   */
  getBaseURL(): string {
    return this._baseURL
  }

  /**
   * ### Run the rpc server.
   *
   * The server will listen on the specified port.
   *
   * @param {number} port The port number.
   * @param {() => any} [callback] Also available {@linkcode Promise.then} function.
   * @return {Promise<this>}
   * @memberof RpcBootstrap
   */
  async run(port: number, callback?: () => any): Promise<this> {
    // Run the beforeRun method of all rpc plugins.
    await Promise.all(this._rpcPlugins.map(async plugin => await plugin.beforeRun?.(this)))
    const adapter = this.getBackendAdapter()
    await adapter.setupHandler(new RpcHttpHandler(this._baseURL))
    // Run the beforeListen method of all rpc plugins.
    await Promise.all(this._rpcPlugins.map(async plugin => await plugin.beforeListen?.(this)))
    await adapter.listen(port, callback)
    // Run the afterListen method of all rpc plugins.
    await Promise.all(this._rpcPlugins.map(async plugin => await plugin.afterListen?.(this)))
    return this
  }

  /**
   * ### Close the rpc server.
   *
   * The server will be closed.
   *
   * @return {Promise<void>}
   * @memberof RpcBootstrap
   */
  async close(): Promise<void> {
    const adapter = this.getBackendAdapter()
    await adapter.close()
  }

  private readonly _rpcPlugins: RpcServerPlugin[] = []
  /**
   * ### Use a rpc plugin.
   *
   * The plugin will be used in the rpc server.
   *
   * @param {RpcPlugin} rpcPlugin The rpc plugin.
   * @return {this}
   * @memberof RpcBootstrap
   */
  use(rpcPlugin: RpcServerPlugin): this {
    this._rpcPlugins.push(rpcPlugin)
    return this
  }
}
