/// <reference types="vite/client" />

import { env } from 'node:process'
import { NodeAdapter } from '@nailyjs/backend/node-adapter'
import { ConfigPlugin } from '@nailyjs/config'
import { RpcBootstrap } from '@nailyjs/rpc'
import { TypeOrmPlugin } from '@nailyjs/typeorm'
import { getEntities } from './utils/entities'

// 导入配置、控制器
import './configurations'
import './controllers'

export const app = new RpcBootstrap()
  .use(ConfigPlugin())
  .use(TypeOrmPlugin({ entities: getEntities() }))
  .setBackendAdapter(NodeAdapter)
  .setBaseURL('/rpc')

if (import.meta.env.PROD && env.NODE_ENV === 'production')
  app.run(3000).then(() => console.log('Server started at http://localhost:3000'))
