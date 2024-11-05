import type { Class, ClassWrapper } from '@nailyjs/ioc'
import type { IBackendAdapter } from './types'
import { AbstractBootstrap } from '@nailyjs/ioc'
import { ControllerMethodExecutor } from './services/controller-method-executor'
import { ControllerScanner } from './services/controller-scanner'

export class BackendBootstrap extends AbstractBootstrap {
  protected _backendAdapter: IBackendAdapter
  setBackendAdapter(backendAdapter: IBackendAdapter | Class<IBackendAdapter>): this {
    if (typeof backendAdapter !== 'function') {
      this._backendAdapter = backendAdapter
      return this
    }

    if (this.getContainer().has(backendAdapter)) {
      this._backendAdapter = (this.getContainer().get(backendAdapter) as ClassWrapper)
        .getClassFactory()
        .getOrCreateInstance()
      return this
    }

    this._backendAdapter = this.createClassWrapper(backendAdapter)
      .getClassFactory()
      .getOrCreateInstance()

    return this
  }

  getBackendAdapter(): IBackendAdapter {
    return this._backendAdapter
  }

  getControllerScanner(): ControllerScanner {
    if (this.getContainer().has(ControllerScanner)) return (this.getContainer().get(ControllerScanner) as ClassWrapper)
      .getClassFactory()
      .getOrCreateInstance()
    return this.createClassWrapper(ControllerScanner)
      .getClassFactory()
      .getOrCreateInstance()
  }

  getControllerMethodExecutor(): ControllerMethodExecutor {
    if (this.getContainer().has(ControllerMethodExecutor)) return (this.getContainer().get(ControllerMethodExecutor) as ClassWrapper)
      .getClassFactory()
      .getOrCreateInstance()

    return this.createClassWrapper(ControllerMethodExecutor)
      .getClassFactory()
      .getOrCreateInstance()
  }

  public override async run(port: number, callback?: () => any): Promise<any> {
    await this.getPluginRunner().runBeforeRun()
    this.getControllerMethodExecutor()
      .setBackendAdapter(this.getBackendAdapter())
      .setup()

    return await this.getBackendAdapter()
      .listen(port, callback)
  }
}
