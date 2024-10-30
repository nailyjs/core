import type { Container, PluginProtocol } from '@nailyjs/ioc'
import type { ValueMetadata } from './decorators'
import { InjectableWrapper } from '@nailyjs/ioc'
import { JexlExecutor } from '@nailyjs/jexl'
import { ConfigProvider } from './config-provider'

class ConfigurationPluginImpl implements PluginProtocol {
  name: string = 'naily:configuration-plugin'

  async install(bootstrap: Container): Promise<void> {
    const injectableContainer = bootstrap.getInjectableContainer()
    const jexlExecutor: JexlExecutor = InjectableWrapper.getOrCreateInjectableWrapper(JexlExecutor).getOrCreateInstance()
    const configProvider: ConfigProvider = InjectableWrapper.getOrCreateInjectableWrapper(ConfigProvider).getOrCreateInstance()

    const configuration = await configProvider.readConfiguration(bootstrap)
    const newInjectableContainer = new Set<InjectableWrapper>()

    for (const wrapper of injectableContainer) {
      const target = wrapper.getTarget()
      const valueMetadata: ValueMetadata[] = Reflect.getMetadata('__value__', target) || []

      const createRawInstance = wrapper.createRawInstance.bind(wrapper)
      wrapper.createRawInstance = function (args) {
        for (const metadata of valueMetadata) {
          const { path, parameterIndex } = metadata
          if (typeof parameterIndex !== 'number') continue
          if (!path) {
            args[parameterIndex] = configuration.config
            continue
          }
          const value = jexlExecutor.evalSync(path, configuration.config)
          args[parameterIndex] = value
        }
        const instance = createRawInstance(args)
        for (const metadata of valueMetadata) {
          const { path, propertyKey, parameterIndex } = metadata
          if (typeof parameterIndex === 'number') continue
          if (!path) {
            instance[propertyKey] = configuration.config
            continue
          }
          const value = jexlExecutor.evalSync(path, configuration.config)
          instance[propertyKey] = value
        }
        return instance
      }
      newInjectableContainer.add(wrapper)
    }
    bootstrap.replaceInjectableContainer(newInjectableContainer)
  }
}

export function ConfigurationPlugin(): PluginProtocol {
  return new ConfigurationPluginImpl()
}
