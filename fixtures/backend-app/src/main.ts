import { NodeBootstrap } from '@nailyjs/backend/node-adapter'

new NodeBootstrap().run(5173).then(() => {
  console.log('app is running on http://localhost:5173')
})
