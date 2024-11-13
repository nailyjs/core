/// <reference types="vite/client" />

import { NodeBootstrap } from '@nailyjs/backend/node-adapter'
import { ConfigPlugin } from '@nailyjs/config'
import { TypeOrmPlugin } from '@nailyjs/typeorm'

import './zod.filter'
import './app.controller'

export const app = new NodeBootstrap()
  .use(ConfigPlugin())
  .use(TypeOrmPlugin())

if (import.meta.env.PROD)
  app.run(5173, () => console.log('app is running on http://localhost:5173'))
