import type { ResolvedConfig, UserInputConfig } from 'c12'
import { Container, Injectable } from '@nailyjs/ioc'
import { JexlExecutor } from '@nailyjs/jexl'
import { loadConfig } from 'c12'
import { Configuration as ConfigurationSymbol } from './plugin-protocol'

@Injectable()
export class ConfigProvider {
  constructor(private readonly jexlExecutor: JexlExecutor) {}

  private getDefaultConfiguration(): UserInputConfig {
    return {
      name: 'naily',
    }
  }

  private c12InstanceCache: ResolvedConfig | undefined
  private async getC12Instance(config: UserInputConfig = this.getDefaultConfiguration()): ReturnType<typeof loadConfig> {
    if (this.c12InstanceCache) return this.c12InstanceCache
    const c12Instance = await loadConfig(config || this.getDefaultConfiguration())
    this.c12InstanceCache = c12Instance
    return c12Instance
  }

  private getCustomConfigurationTarget(bootstrap: Container): ConfigurationSymbol | undefined {
    const customTarget = bootstrap.getInjectableTargetByToken(ConfigurationSymbol)
    if (!customTarget) return undefined
    return customTarget.getOrCreateInstance()
  }

  async readConfiguration(bootstrap: Container = new Container()): ReturnType<typeof loadConfig> {
    const customTargetInstance = this.getCustomConfigurationTarget(bootstrap)
    if (!customTargetInstance) return await this.getC12Instance()

    if (!customTargetInstance.configure || typeof customTargetInstance.configure !== 'function')
      return await this.getC12Instance()
    const configuration = await customTargetInstance.configure(this.getDefaultConfiguration())
    return await this.getC12Instance(configuration)
  }

  async evaluateExpression<El extends string>(el: El): Promise<any> {
    return this.jexlExecutor.evalSync(el, (await this.readConfiguration()).config)
  }
}
