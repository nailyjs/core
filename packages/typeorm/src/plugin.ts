import { Container, IocPlugin } from '@nailyjs/ioc'
import { DataSourceService } from './datasource'

class TypeOrmPluginImpl implements IocPlugin {
  name: string = 'naily:typeorm'

  constructor(private readonly transient: boolean = false) {}

  async beforeRun(container: Container): Promise<void> {
    const service = DataSourceService.getInstance(container)
    const dataSource = await service.getDataSource(container, this.transient)
    if (!dataSource.isInitialized) await dataSource.initialize()
  }
}

export function TypeOrmPlugin(transient: boolean = false): IocPlugin {
  return new TypeOrmPluginImpl(transient)
}
