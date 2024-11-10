import type { Entities } from './types'
import { Value } from '@nailyjs/config'
import { Autowired, Container, Injectable, Optional } from '@nailyjs/ioc'
import { DataSource, type DataSourceOptions } from 'typeorm'
import { CustomDataSource } from './custom.protocol'

@Injectable()
export class DataSourceFactory {
  constructor(
    @Value('naily.typeorm')
    private readonly typeorm: DataSourceOptions,
    private readonly container: Container,
    @Optional()
    @Autowired(CustomDataSource)
    private readonly _customDataSourceService?: CustomDataSource,
  ) {}

  async getDataSourceOptions(): Promise<DataSourceOptions> {
    if (this._customDataSourceService && typeof this._customDataSourceService.configure === 'function') {
      return await this._customDataSourceService.configure(this.typeorm)
    }
    return this.typeorm
  }

  async getDataSource(entities: Entities): Promise<DataSource> {
    const options = await this.getDataSourceOptions()
    const dataSource = new DataSource({
      ...options,
      entities,
    })
    await dataSource.initialize()
    this.container.createConstantWrapper(DataSource, dataSource).save()
    return dataSource
  }
}
