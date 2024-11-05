import path from 'node:path'
import { cwd } from 'node:process'
import { defineConfig } from './packages/config/src/helper'

export default defineConfig({
  naily: {
    cli: {},

    typeorm: {
      type: 'sqlite',
      database: path.join(cwd(), './node_modules/.cache/naily/typeorm.db'),
      name: 'default',
      synchronize: true,
      logging: true,
    },
  },
})
