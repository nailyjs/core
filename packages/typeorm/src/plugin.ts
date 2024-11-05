import { ClassWrapper, Container, IocPlugin } from '@nailyjs/ioc'
import { type CustomDataSource, DataSourceService } from './datasource'

class TypeOrmPluginImpl implements IocPlugin {
  name: string = 'naily:typeorm'

  getDataSourceWrapper(container: Container): DataSourceService {
    const dataSource = container.getContainer().get(DataSourceService) as ClassWrapper<CustomDataSource>
    if (!dataSource || dataSource.wrapperType !== 'class') return container.createClassWrapper(DataSourceService)
      .getClassFactory()
      .getOrCreateInstance()

    return dataSource
      .getClassFactory()
      .getOrCreateInstance()
  }

  async beforeRun(container: Container): Promise<void> {
    const dataSourceWrapper = this.getDataSourceWrapper(container)
    const dataSource = await dataSourceWrapper.getDataSource()
    if (!dataSource.isInitialized) await dataSource.initialize()
  }
}

export function TypeOrmPlugin(): IocPlugin {
  return new TypeOrmPluginImpl()
}
