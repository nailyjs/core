import { ConfigPlugin } from '@nailyjs/config'
import { CliBootstrap } from './cli-bootstrap'

new CliBootstrap()
  .use(ConfigPlugin())
  .run()
