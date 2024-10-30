/// Cannot be use in rspack.

import { createRspackPlugin } from 'unplugin'
import { unpluginFactory } from '.'

export default createRspackPlugin(unpluginFactory)
