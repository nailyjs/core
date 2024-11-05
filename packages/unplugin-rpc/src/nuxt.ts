import type { Options } from './types'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import vite from './vite'
import '@nuxt/schema'

export interface ModuleOptions extends Options {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'naily:unplugin-rpc',
    configKey: 'rpc',
  },
  defaults: {
    // ...default options
  },
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options))
  },
})
