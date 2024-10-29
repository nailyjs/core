import { NodeBootstrap } from '@nailyjs/backend/node-adapter'
import { Configuration } from '@nailyjs/config'
import './test.controller'
import './test.filter'

new NodeBootstrap()
  .use(Configuration())
  .then(bootstrap => bootstrap.run(3000))
  .then(() => console.log(`Backend started on port http://localhost:3000`))
