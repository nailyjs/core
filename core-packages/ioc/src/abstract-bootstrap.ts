import type { ContainerProtocol } from './container-protocol'
import type { PluginProtocol } from './plugin-protocol'
import { Container } from './container'

export abstract class AbstractBootstrap extends Container implements ContainerProtocol {
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
    // eslint-disable-next-line node/prefer-global/process
    return 'versions' in globalThis.process
      // eslint-disable-next-line node/prefer-global/process
      && 'node' in globalThis.process.versions
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

  /**
   * ### Check current is running in browser environment.
   *
   * @static
   * @return {boolean}
   * @memberof BackendBootstrap
   */
  static isClient(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
  }

  pluginContainer: Map<string, PluginProtocol> = new Map()
  async use(plugin: PluginProtocol | PluginProtocol[]): Promise<this> {
    if (Array.isArray(plugin)) {
      for (const p of plugin)
        await this.use(p)
      return this
    }

    if (this.pluginContainer.has(plugin.name)) return this
    await plugin.install(this)
    this.pluginContainer.set(plugin.name, plugin)
    return this
  }
}
