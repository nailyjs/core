/// <reference types="vite/client" />

import { NodeHttpAdapter } from '@nailyjs/backend/node-adapter'
import { RpcBootstrap } from '@nailyjs/rpc'
import './welcome-server'

export const app = new RpcBootstrap(new NodeHttpAdapter())
  .setBaseURL('/rpc')

if (import.meta.env.PROD)
  app.run(1000)
