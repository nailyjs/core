import { BackendPlugin } from '@nailyjs/backend'
import { Container } from '@nailyjs/ioc'
import { DataSourceService } from './datasource'

class TypeOrmPluginImpl implements BackendPlugin {
  name: string = 'naily:typeorm'

  constructor(private readonly transient: boolean = false) {}

  async beforeRun(container: Container): Promise<void> {
    const service = DataSourceService.getInstance(container)
    await service.getDataSource(container, this.transient)
  }

  async beforeHandle(_handlerContext: Request, container: Container): Promise<void> {
    const service = DataSourceService.getInstance(container)
    const dataSource = await service.getDataSource(container, this.transient)
    if (!dataSource.isInitialized) await dataSource.initialize()
  }
}

export function TypeOrmPlugin(transient: boolean = false): BackendPlugin {
  return new TypeOrmPluginImpl(transient)
}
