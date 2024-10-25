import type { AbstractHttpAdapter } from './backend-adapter'
import process from 'node:process'
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

  /**
   * ### Check if the backend is running in `Bun` environment.
   *
   * @see Bun official website: [Bun — A fast all-in-one JavaScript runtime](https://bun.sh)
   * @static
   * @return {boolean}
   * @memberof BackendBootstrap
   */
  static isBun(): boolean {
    return 'Bun' in globalThis
  }

  /**
   * ### Check if the backend is running in Node.js environment.
   *
   * @see Node.js official website: [Node.js — Run JavaScript Everywhere](https://nodejs.org)
   * @static
   * @return {boolean}
   * @memberof BackendBootstrap
   */
  static isNode(): boolean {
    return 'versions' in process
      && 'node' in process.versions
  }

  /**
   * ### Check if the backend is running in Deno environment.
   *
   * @see Deno official website: [Deno, the next-generation JavaScript runtime](https://deno.land)
   * @static
   * @return {boolean}
   * @memberof BackendBootstrap
   */
  static isDeno(): boolean {
    return 'Deno' in globalThis
  }
}
