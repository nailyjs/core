import { Container, IocPlugin } from '@nailyjs/ioc'
import { DataSourceService } from './datasource'

class TypeOrmPluginImpl implements IocPlugin {
  name: string = 'naily:typeorm'

  async beforeRun(container: Container): Promise<void> {
    const service = DataSourceService.getInstance(container)
    const dataSource = await service.getDataSource(container)
    if (!dataSource.isInitialized) await dataSource.initialize()
  }
}

export function TypeOrmPlugin(): IocPlugin {
  return new TypeOrmPluginImpl()
}
