import { Configuration } from '@nailyjs/ioc'
import { CustomDataSource } from '@nailyjs/typeorm'
import { DataSourceOptions } from 'typeorm'

@Configuration(CustomDataSource)
export class TypeOrmConfiguration implements CustomDataSource {
  configure(oldOptions: DataSourceOptions): DataSourceOptions | Promise<DataSourceOptions> {
    return {
      ...oldOptions,
      synchronize: true,
      logging: true,
    }
  }
}
