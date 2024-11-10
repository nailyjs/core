import { Value } from '@nailyjs/config'
import { Autowired, ClassWrapper, Container, Injectable, IocPlugin, Optional } from '@nailyjs/ioc'
import { DataSource, type DataSourceOptions, MixedList } from 'typeorm'
import { EntitySchema } from 'typeorm/browser'

export const CustomDataSource = '__naily_custom_data_source__'
export interface CustomDataSource {
  configure(oldOptions: DataSourceOptions): DataSourceOptions | Promise<DataSourceOptions>
}

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

  // eslint-disable-next-line ts/no-unsafe-function-type
  async getDataSource(entities: MixedList<Function | string | EntitySchema>): Promise<DataSource> {
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

// eslint-disable-next-line ts/no-unsafe-function-type
export type Entities = MixedList<Function | string | EntitySchema>
export type AsyncableCallback<T> = () => Promise<T> | T
export interface TypeOrmPluginOptions {
  entities?: Entities | AsyncableCallback<Entities>
}

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
