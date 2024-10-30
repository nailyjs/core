import { NodeBootstrap } from '@nailyjs/backend/node-adapter'
import { CachePlugin } from '@nailyjs/cache'
import { ConfigurationPlugin } from '@nailyjs/config'
import './custom-configuration.service'
import './test.controller'
import './test.filter'

new NodeBootstrap()
  .use(ConfigurationPlugin())
  .then(bootstrap => bootstrap.use(CachePlugin()))
  .then(bootstrap => bootstrap.run(3000))
  .then(() => console.log(`Backend started on port http://localhost:3000`))
