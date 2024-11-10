import type { DataSourceOptions } from 'typeorm'

export const CustomDataSource = '__naily_custom_data_source__'
export interface CustomDataSource {
  configure(oldOptions: DataSourceOptions): DataSourceOptions | Promise<DataSourceOptions>
}
