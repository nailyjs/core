import { BackendBootstrap } from '@nailyjs/backend'
import { RpcControllerScanner } from './rpc-controller-scanner'
import { RpcMethodExecutor } from './rpc-method-executor'

export class RpcBootstrap extends BackendBootstrap {
  private _baseURL: string = '/'
  setBaseURL(baseURL: string): this {
    this._baseURL = baseURL
    return this
  }

  getBaseURL(): string {
    return this._baseURL
  }

  getRpcControllerScanner(): RpcControllerScanner {
    const scannerWrapper = this.getContainer().get(RpcControllerScanner)
    if (!scannerWrapper || scannerWrapper.wrapperType !== 'class')
      return this.createClassWrapper(RpcControllerScanner)
        .save()
        .getClassFactory()
        .getOrCreateInstance()
    return scannerWrapper.getClassFactory().getOrCreateInstance()
  }

  getRpcMethodExecutor(): RpcMethodExecutor {
    const executorWrapper = this.getContainer().get(RpcMethodExecutor)
    if (!executorWrapper || executorWrapper.wrapperType !== 'class')
      return this.createClassWrapper(RpcMethodExecutor)
        .save()
        .getClassFactory()
        .getOrCreateInstance()
    return executorWrapper.getClassFactory().getOrCreateInstance()
  }

  public override async run(port: number, callback?: () => any): Promise<any> {
    this.getRpcMethodExecutor()
      .setBackendAdapter(this.getBackendAdapter())
      .setup()

    return await this.getBackendAdapter()
      .listen(port, callback)
  }
}
