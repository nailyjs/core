import { NodeAdapter } from '@nailyjs/backend/node-adapter'
import { Injectable } from '@nailyjs/ioc'
import { createAxiosClient, RpcBootstrap, RpcController } from '../src'

const PORT = 3000

export const WelcomeServer = 'WelcomeServer'
export interface WelcomeServer {
  readonly testService: TestService
}

@Injectable()
export class TestService {
  async getHello(): Promise<string> {
    createAxiosClient({
      urlOrAxiosInstance: `http://localhost:${PORT}`,
      ssr: false,
    })
      .request<WelcomeServer>(WelcomeServer)
      .testService
      .getWorld()
      .then(world => console.log('success!:', world))
      .catch(err => console.error('error!', err))

    return 'Hello, World!'
  }

  getWorld(): string {
    return 'World'
  }
}

@RpcController(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
  constructor(public readonly testService: TestService) {}

  getHello(): Promise<string> {
    return this.testService.getHello()
  }

  getWorld(): string {
    return 'World'
  }

  testNested = {
    foo: () => {
      return this.getWorld()
    },
  }
}

new RpcBootstrap()
  .setBackendAdapter(NodeAdapter)
  .run(PORT)
  .then(() => console.log('Server started on http://localhost:3000'))
