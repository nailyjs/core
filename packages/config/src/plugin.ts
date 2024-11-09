import type { UserInputConfig } from 'c12'
import { ClassWrapper, Container, IocPlugin } from '@nailyjs/ioc'
import { C12Service, C12ServiceImpl } from './c12'
import { ValueMetadata, ValueWatermark } from './decorators'
import { JexlExecutor } from './jexl'

class ConfigPluginImpl implements IocPlugin {
  public name: string = 'naily:config-plugin'

  private getJexlExecutor(container: Container): JexlExecutor {
    const map = container.getContainer()
    const jexlExecutorWrapper = map.get(JexlExecutor)
    if (!jexlExecutorWrapper) return new JexlExecutor()
    if (jexlExecutorWrapper.wrapperType !== 'class') return new JexlExecutor()
    return jexlExecutorWrapper
      .getClassFactory()
      .getOrCreateInstance()
  }

  private getC12Service(container: Container): C12Service {
    const map = container.getContainer()
    const c12ServiceWrapper = map.get(C12Service)
    if (!c12ServiceWrapper) return new C12ServiceImpl()
    if (c12ServiceWrapper.wrapperType !== 'class') return new C12ServiceImpl()
    return c12ServiceWrapper
      .getClassFactory()
      .getOrCreateInstance()
  }

  private applyValuePropertyMetadata(wrapper: ClassWrapper, jexlExecutor: JexlExecutor, config: UserInputConfig): void {
    const target = wrapper.getTarget()
    const values: ValueMetadata[] = Reflect.getMetadata(ValueWatermark, target) || []

    const oldSetSingletonInstance = wrapper.setSingletonInstance.bind(wrapper)
    wrapper.setSingletonInstance = function (instance: any) {
      for (const value of values) {
        if (typeof value.parameterIndex === 'number') continue
        instance[value.propertyKey] = jexlExecutor.evalSync(value.jexl, config)
      }
      return oldSetSingletonInstance(instance)
    }

    wrapper.save()
  }

  private applyValueParameterMetadata(wrapper: ClassWrapper, jexlExecutor: JexlExecutor, config: UserInputConfig): void {
    const target = wrapper.getTarget()
    const values: ValueMetadata[] = Reflect.getMetadata(ValueWatermark, target) || []
    const classFactory = wrapper.getClassFactory()

    const oldCreateRawInstance = classFactory.createRawInstance.bind(classFactory)
    classFactory.createRawInstance = function (args: any[]) {
      for (const value of values) {
        if (typeof value.parameterIndex !== 'number') continue
        args[value.parameterIndex] = jexlExecutor.evalSync(value.jexl, config)
      }
      return oldCreateRawInstance(args)
    }
    wrapper.save()
  }

  async beforeRun(container: Container): Promise<void> {
    const map = container.getContainer()
    const jexlExecutor = this.getJexlExecutor(container)
    const c12Service = this.getC12Service(container)
    const c12Config = await c12Service.getConfiguration()

    for (const [_injectionToken, wrapper] of map) {
      if (wrapper.wrapperType !== 'class') continue
      this.applyValueParameterMetadata(wrapper, jexlExecutor, c12Config.config)
      this.applyValuePropertyMetadata(wrapper, jexlExecutor, c12Config.config)
    }
  }
}

export function ConfigPlugin(): IocPlugin {
  return new ConfigPluginImpl()
}
