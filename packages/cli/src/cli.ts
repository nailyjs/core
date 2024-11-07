import { ConfigPlugin } from '@nailyjs/config'
import { CliBootstrap } from './index'

new CliBootstrap()
  .use(ConfigPlugin())
  .run()
