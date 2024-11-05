import { Value } from '@nailyjs/config'
import { Autowired, ClassWrapper, Container, Injectable, Optional } from '@nailyjs/ioc'
import { DataSource, type DataSourceOptions } from 'typeorm'

declare global {
  namespace Naily {
    export namespace Configuration {
      export interface NailyUserConfig {
        /** TypeORM configuration */
        typeorm?: DataSourceOptions
      }
    }
  }
}

export const CustomDataSource = '__naily_typeorm_custom_datasource__'
export interface CustomDataSource {
  configure(oldOptions: DataSourceOptions): DataSourceOptions | Promise<DataSourceOptions>
}

@Injectable()
export class DataSourceService {
  constructor(
    @Value('naily.typeorm')
    private readonly _typeOrmConfiguration: DataSourceOptions,
    private readonly container: Container,
    @Optional()
    @Autowired(CustomDataSource)
    private readonly _customDataSource?: CustomDataSource,
  ) {}

  private createDataSourceWrapper(options: DataSourceOptions): ClassWrapper<DataSource> {
    const dataSourceWrapper = this.container.createClassWrapper(DataSource)
    const dataSourceFactory = dataSourceWrapper.getClassFactory().createRawInstance([options || {}])
    dataSourceWrapper.setSingletonInstance(dataSourceFactory)
    return dataSourceWrapper.save()
  }

  async getDataSource(): Promise<DataSource> {
    const container = this.container.getContainer()
    if (container.has(DataSource))
      return (container.get(DataSource) as ClassWrapper<DataSource>).getSingletonInstance()

    if (this._customDataSource && typeof this._customDataSource.configure === 'function') {
      const customDataSourceWrapper = this.container.getContainer().get(CustomDataSource) as ClassWrapper<CustomDataSource>
      if (!customDataSourceWrapper || customDataSourceWrapper.wrapperType !== 'class')
        return this.createDataSourceWrapper(this._typeOrmConfiguration).getSingletonInstance()
      if (!customDataSourceWrapper.getMetadataScanner().getInjectableMetadata().isConfigurationDecorator())
        throw new Error('CustomDataSource must be decorated with @Configuration.')

      const configuredDataSource = await this._customDataSource.configure(this._typeOrmConfiguration)
      return this.createDataSourceWrapper(configuredDataSource).getSingletonInstance()
    }
    return this.createDataSourceWrapper(this._typeOrmConfiguration).getSingletonInstance()
  }
}
