import { ConfigPlugin } from '@nailyjs/config'
import { WinstonPlugin } from '@nailyjs/winston'
import { CliBootstrap } from './index'

new CliBootstrap()
  .use(ConfigPlugin())
  .use(WinstonPlugin())
  .run()
