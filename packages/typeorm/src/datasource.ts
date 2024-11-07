import { Value } from '@nailyjs/config'
import { Autowired, ClassWrapper, ConstantWrapper, Container, Injectable, Optional } from '@nailyjs/ioc'
import { DataSource, type DataSourceOptions } from 'typeorm'

export const CustomDataSource = '__naily_typeorm_custom_datasource__'
export interface CustomDataSource {
  configure(oldOptions: DataSourceOptions): DataSourceOptions | Promise<DataSourceOptions>
}

@Injectable()
export class DataSourceService {
  constructor(
    @Value('naily.typeorm')
    private readonly _typeOrmConfiguration: DataSourceOptions,
    @Optional()
    @Autowired(CustomDataSource)
    private readonly _customDataSourceService?: CustomDataSource,
  ) {}

  private createDataSourceWrapper(options: DataSourceOptions, container: Container): ConstantWrapper<DataSource> {
    if (container.getContainer().has(DataSource)) return container.getContainer().get(DataSource) as ConstantWrapper<DataSource>
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return container.createConstantWrapper(DataSource, new DataSource(options || {})).save()
  }

  async getDataSource(container: Container): Promise<DataSource> {
    const map = container.getContainer()
    if (map.has(DataSource)) return (map.get(DataSource) as ConstantWrapper<DataSource>).getValue()

    if (this._customDataSourceService && typeof this._customDataSourceService.configure === 'function') {
      const configuredDataSource = await this._customDataSourceService.configure(this._typeOrmConfiguration)
      return this.createDataSourceWrapper(configuredDataSource, container).getValue()
    }
    return this.createDataSourceWrapper(this._typeOrmConfiguration, container).getValue()
  }

  static getInstance(container: Container): DataSourceService {
    const dataSource = container.getContainer().get(DataSourceService) as ClassWrapper<CustomDataSource>
    if (dataSource) return dataSource.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(DataSourceService).save().getClassFactory().getOrCreateInstance()
  }
}
