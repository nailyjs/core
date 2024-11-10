import { ClassWrapper, Container, IocPlugin } from '@nailyjs/ioc'
import { DataSourceFactory } from './datasource.service'
import { TypeOrmPluginOptions } from './types'

export class TypeOrmPluginImpl implements IocPlugin {
  name: string = 'naily:typeorm-plugin'

  constructor(private readonly options: TypeOrmPluginOptions = {}) {}

  async beforeRun(container: Container): Promise<void> {
    const factoryWrapper = container.getContainer().get(DataSourceFactory) as ClassWrapper<DataSourceFactory>
    if (!factoryWrapper || factoryWrapper.wrapperType !== 'class')
      return container.createClassWrapper(DataSourceFactory).getClassFactory().getOrCreateInstance()
    const factory = factoryWrapper.getClassFactory().getOrCreateInstance()

    if (!this.options || !this.options.entities) {
      await factory.getDataSource([])
      return
    }
    const entities = typeof this.options.entities === 'function' ? await this.options.entities() : this.options.entities
    await factory.getDataSource(entities)
  }
}

export function TypeOrmPlugin(options?: TypeOrmPluginOptions): IocPlugin {
  return new TypeOrmPluginImpl(options)
}
