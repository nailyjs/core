/// <reference types="@nailyjs/cli" />

import path from 'node:path'
import { cwd } from 'node:process'
import { defineConfig } from '@nailyjs/config'

export default defineConfig({
  naily: {
    typeorm: {
      type: 'sqlite',
      database: path.join(cwd(), 'node_modules/.cache/naily.db'),
    },

    cli: {
      development: {
        using: 'vite',
        rpc: {},
      },
    },
  },
})
