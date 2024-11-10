import { Value } from '@nailyjs/config'
import { Autowired, ClassWrapper, Container, Injectable, Optional } from '@nailyjs/ioc'
import { DataSource, type DataSourceOptions } from 'typeorm'

export const CustomDataSource = '__naily_typeorm_custom_datasource__'
export interface CustomDataSource {
  configure(oldOptions: DataSourceOptions): DataSourceOptions | Promise<DataSourceOptions>
}

@Injectable()
export class DataSourceService {
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

  async getDataSource(): Promise<DataSource> {
    const options = await this.getDataSourceOptions()
    const dataSource = new DataSource(options)
    await dataSource.initialize()
    this.container.createConstantWrapper(DataSource, dataSource).save()
    return dataSource
  }

  static getInstance(container: Container): DataSourceService {
    const factoryWrapper = container.getContainer().get(DataSourceService) as ClassWrapper<DataSourceService>
    if (!factoryWrapper || factoryWrapper.wrapperType !== 'class') throw new Error('DataSourceFactory not found')
    return factoryWrapper.getClassFactory().getOrCreateInstance()
  }
}
