/// <reference types="vite/client" />

import { NodeHttpAdapter } from '@nailyjs/backend/node-adapter'
import { RpcBootstrap } from '@nailyjs/rpc'
import './welcome-server'

export const app = new RpcBootstrap(new NodeHttpAdapter())

if (import.meta.env.PROD)
  app.run(1000).then(() => console.log('Server started on http://localhost:1000'))
