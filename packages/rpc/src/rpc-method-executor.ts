import { IBackendAdapter } from '@nailyjs/backend'
import { Container } from '@nailyjs/ioc'
import { RpcControllerScanner } from './rpc-controller-scanner'
import { RpcHandlerContext } from './rpc-handler-context'

export class RpcMethodExecutor {
  constructor(private readonly controllerScanner: RpcControllerScanner) {
    if (!controllerScanner) this.controllerScanner = new RpcControllerScanner(new Container())
  }

  private _backendAdapter: IBackendAdapter
  setBackendAdapter(backendAdapter: IBackendAdapter): this {
    this._backendAdapter = backendAdapter
    return this
  }

  getBackendAdapter(): IBackendAdapter {
    return this._backendAdapter
  }

  async setup(): Promise<void> {
    const controllers = this.controllerScanner.getRpcControllerWrapper()
    await this.getBackendAdapter().setupHandle(new RpcHandlerContext(controllers))
  }
}
