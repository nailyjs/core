import { NodeHttpAdapter } from '@nailyjs/backend/node-adapter'
import { RpcBootstrap, RpcController } from '../src'

export const Test = 'Test'

@RpcController(Test)
export class TestRpcController {
  async test(): Promise<string> {
    return 'Hello, World!'
  }
}

new RpcBootstrap(new NodeHttpAdapter())
  .setBaseURL('/rpc')
  .run(1000)
  .then(() => console.log('Server is running on http://localhost:1000/rpc'))
