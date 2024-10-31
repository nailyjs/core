import type { IocPlugin } from './protocols'
import { Container } from './container'
import { PluginRunner } from './plugin-runner'

export abstract class AbstractBootstrap extends Container {
  private _pluginRunner: PluginRunner | null = null
  getPluginRunner(): PluginRunner {
    if (!this._pluginRunner) this._pluginRunner = new PluginRunner(this)
    return this._pluginRunner
  }

  use(plugin: IocPlugin | IocPlugin[]): this {
    this.getPluginRunner().addPlugin(plugin)
    return this
  }

  abstract run(...args: any[]): Promise<any>
}
