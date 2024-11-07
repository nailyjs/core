import { NodeBootstrap } from '@nailyjs/backend/node-adapter'
import { ConfigPlugin } from '@nailyjs/config'
import { TypeOrmPlugin } from '@nailyjs/typeorm'

new NodeBootstrap()
  .use(ConfigPlugin())
  .use(TypeOrmPlugin())
  .run(5173, () => {
    console.log('app is running on http://localhost:5173')
  })
