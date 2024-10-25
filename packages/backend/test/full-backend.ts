import type { HandlerRequest, HandlerResponse } from '../src'
import { Injectable } from '@nailyjs/ioc'
import { BackendBootstrap, BackendContainer, HandlerContext } from '../src'
import { NodeHttpAdapter } from '../src/node-adapter'

(async () => {
  class NodeHandlerContext extends HandlerContext {
    async callback(request: HandlerRequest): Promise<HandlerResponse> {
      try {
        console.log(request)
        return new Response('Hello, World!')
      }
      catch (error) { await this.catchError(error) }
      finally { await this.catchFinally() }
    }

    catchError(error: unknown): void | Promise<void> {
      console.error(error)
    }

    catchFinally(): void | Promise<void> {
      console.log('Finally')
    }
  }

  @Injectable()
  class Bootstrap extends BackendBootstrap {
    constructor() {
      super(new NodeHttpAdapter())
    }

    async run(callback?: () => any): Promise<this> {
      const bootstrap: InstanceType<typeof Bootstrap> = new BackendContainer().getInjectableTarget(Bootstrap).getOrCreateInstance()
      const adapter = bootstrap.getBackendAdapter()
      await adapter.setupHandler(new NodeHandlerContext())
      await adapter.listen(3000, callback)
      return this
    }
  }

  await new Bootstrap()
    .run()
    .then(() => console.log('Server is running on port 3000'))
})()
