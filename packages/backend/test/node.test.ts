import { NodeBootstrap } from '../adapters/node'

describe('node', () => {
  it('should work', async () => {
    const app = new NodeBootstrap()
    app.run(3000)
  })
})
