import type { AbstractBootstrap } from './bootstrap'
import type { IocPlugin } from './protocols'

export class PluginRunner {
  constructor(private readonly bootstrap: AbstractBootstrap) {}

  private pluginsContainer: IocPlugin[] = []

  addPlugin(plugin: IocPlugin | IocPlugin[]): void {
    if (Array.isArray(plugin)) this.pluginsContainer.push(...plugin)
    else this.pluginsContainer.push(plugin)
    this.pluginsContainer = Array.from(new Set(this.pluginsContainer))
  }

  async runBeforeRun(): Promise<void> {
    for (const plugin of this.pluginsContainer)
      if (plugin.beforeRun) await plugin.beforeRun(this.bootstrap)
  }

  getPluginContainer(): readonly IocPlugin[] {
    return this.pluginsContainer
  }
}
