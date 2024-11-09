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
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return container.createConstantWrapper(DataSource, new DataSource(options || {})).save()
  }

  async getDataSource(container: Container, transient: boolean = false): Promise<DataSource> {
    const map = container.getContainer()
    if (map.has(DataSource) && transient !== false) {
      const inMapDataSource = (map.get(DataSource) as ConstantWrapper<DataSource>).getValue()
      if (inMapDataSource && inMapDataSource.isInitialized) inMapDataSource.destroy()
      map.delete(DataSource)
    }

    if (this._customDataSourceService && typeof this._customDataSourceService.configure === 'function') {
      const configuredDataSource = await this._customDataSourceService.configure(this._typeOrmConfiguration)
      return this.createDataSourceWrapper(configuredDataSource, container).save().getValue()
    }
    return this.createDataSourceWrapper(this._typeOrmConfiguration, container).save().getValue()
  }

  static getInstance(container: Container): DataSourceService {
    const dataSource = container.getContainer().get(DataSourceService) as ClassWrapper<CustomDataSource>
    if (dataSource) return dataSource.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(DataSourceService).save().getClassFactory().getOrCreateInstance()
  }
}
