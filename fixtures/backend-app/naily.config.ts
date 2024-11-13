import path from 'node:path'
import { cwd } from 'node:process'
import { defineConfig } from '@nailyjs/config'
import '@nailyjs/typeorm'
import '@nailyjs/cli'

export default defineConfig({
  naily: {
    typeorm: {
      type: 'sqlite',
      database: path.join(cwd(), './node_modules/.cache/naily/backend-app.sqlite'),
      logging: true,
      synchronize: true,
    },

    cli: {
      development: {
        using: 'vite',
      },
    },
  },
})
