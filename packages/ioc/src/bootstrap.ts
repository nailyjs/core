import type { IocPlugin } from './protocols'
import { FilterWatermark, InjectableWatermark, InjectWatermark, PostConstructWatermark } from './constant'
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

  enableInternalConstant(): this {
    this.createConstantWrapper(InjectableWatermark, InjectableWatermark).save()
    this.createConstantWrapper(InjectWatermark, InjectWatermark).save()
    this.createConstantWrapper(FilterWatermark, FilterWatermark).save()
    this.createConstantWrapper(PostConstructWatermark, PostConstructWatermark).save()
    return this
  }

  abstract run(...args: any[]): Promise<any>
}
