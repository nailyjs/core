import { ConfigPlugin } from '@nailyjs/config'
import { AbstractBootstrap, Component, Injectable, PostConstruct } from '@nailyjs/ioc'
import { Column, DataSource, DataSourceOptions, Entity, PrimaryGeneratedColumn } from 'typeorm'
import configuration from '../../../naily.config'
import { CustomDataSource, TypeOrmPlugin } from '../src'

describe('typeorm', () => {
  it('should work', async () => {
    @Entity()
    class User {
      @PrimaryGeneratedColumn()
      id: number

      @Column()
      name: string

      @Column()
      age: number
    }

    @Injectable()
    class RootService {
      constructor(private readonly dataSource: DataSource) {}

      @PostConstruct()
      async testTransaction() {
        console.log('start executing')

        await this.dataSource.transaction(async (entityManager) => {
          const result = await entityManager.query('SELECT 1 + 1')
          console.log('result:', result)
          expect(result).toStrictEqual([{ '1 + 1': 2 }])
        })
      }
    }

    @Component(CustomDataSource)
    class TypeOrmConfiguration implements CustomDataSource {
      configure(oldOptions: DataSourceOptions): DataSourceOptions | Promise<DataSourceOptions> {
        expect(oldOptions).toStrictEqual(configuration.naily.typeorm)
        return {
          ...oldOptions,
          entities: [User],
        }
      }
    }
    // eslint-disable-next-line ts/no-unused-expressions
    TypeOrmConfiguration.name

    class Bootstrap extends AbstractBootstrap {
      getRootService(): RootService {
        const rootService = this.getContainer().get(RootService)
        if (!rootService || rootService.wrapperType !== 'class') return this.createClassWrapper(RootService).getClassFactory().getOrCreateInstance()
        return rootService.getClassFactory().getOrCreateInstance()
      }

      async run(): Promise<any> {
        await this.getPluginRunner().runBeforeRun()
        return this.getRootService()
      }
    }

    await new Bootstrap()
      .use(ConfigPlugin())
      .use(TypeOrmPlugin())
      .run()
  })
})
