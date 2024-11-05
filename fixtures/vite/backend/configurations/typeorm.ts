import { Configuration } from '@nailyjs/ioc'
import { CustomDataSource } from '@nailyjs/typeorm'
import { DataSourceOptions } from 'typeorm'

type DirPath = string
type ExportKey = string | symbol

@Configuration(CustomDataSource)
export class TypeOrmConfiguration implements CustomDataSource {
  private isClass(value: any): value is new (...args: any[]) => any {
    return typeof value === 'function' && /^\s*class\s+/.test(value.toString())
  }

  configure(oldOptions: DataSourceOptions): DataSourceOptions | Promise<DataSourceOptions> {
    // 因为目前处于`vite`环境下 我们可以利用vite里的`import.meta.glob`宏函数，动态导入所有的models文件夹中的`class`
    // 这样可以避免手动维护`entities`数组，每次都加一堆一堆的`import`语句和`class`名字，非常方便
    const modelModules: Record<DirPath, Record<ExportKey, unknown>> = import.meta.glob('../models/**/*.model.ts', { eager: true })
    // 这里的逻辑可以进一步细化，或者根据实际情况进行调整
    const entities = Object.values(modelModules)
      .map(module => Object.values(module))
      .flat()
      .filter(value => this.isClass(value))

    return {
      ...oldOptions,
      synchronize: true,
      logging: true,
      entities,
    }
  }
}
