import { BackendBootstrap } from '@nailyjs/backend'
import { NodeAdapter } from '@nailyjs/backend/node-adapter'
import { Configuration } from '@nailyjs/ioc'
import { ViteDevServer, ViteDevServerMiddlewareContext } from '../compilers'

@Configuration(ViteDevServer)
export class ViteDevServerImpl implements ViteDevServer {
  async middleware(context: ViteDevServerMiddlewareContext): Promise<any> {
    const bootstrap = context.getBootstrap() as BackendBootstrap
    const req = context.getRequest()
    const res = context.getResponse()

    const nodeAdapter = new NodeAdapter()

    bootstrap.setBackendAdapter(nodeAdapter)
    await bootstrap.getPluginRunner().runBeforeRun()
    await bootstrap.getControllerMethodExecutor()
      .setBackendAdapter(nodeAdapter)
      .setup()

    const handler = nodeAdapter.getHandler()
    return await handler(req, res)
  }
}
