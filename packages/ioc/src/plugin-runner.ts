import type { AbstractBootstrap } from './bootstrap'
import type { IocPlugin } from './protocols'

export class PluginRunner {
  constructor(private readonly bootstrap: AbstractBootstrap) {}

  private pluginsContainer: IocPlugin[] = []

  addPlugin(plugin: IocPlugin | IocPlugin[]): void {
    if (Array.isArray(plugin)) this.pluginsContainer.push(...plugin)
    else this.pluginsContainer.push(plugin)

    // Remove duplicates from the pluginsContainer
    this.pluginsContainer = this.pluginsContainer
      .filter((value, index, self) => self.indexOf(value) === index)
      .filter(plugin => !this.pluginsContainer.some(p => p.name === plugin.name))
  }

  async runBeforeRun(): Promise<void> {
    for (const plugin of this.pluginsContainer)
      if (plugin.beforeRun) await plugin.beforeRun(this.bootstrap)
  }
}
