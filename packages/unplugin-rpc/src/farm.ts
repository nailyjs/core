/// Currently cannot be use in farm, welcome to contribute pull request.
/// If contributed, please remove this line and add a export `./farm` in `package.json`'s `exports` field.

import { createFarmPlugin } from 'unplugin'
import { unpluginFactory } from '.'

export default createFarmPlugin(unpluginFactory)
