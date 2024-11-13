import type { IBackendAdapter } from '../types'
import type { RestControllerWrapper } from '../wrappers/controller-wrapper'
import type { SingleControllerHandlerWrapper } from '../wrappers/single-controller-handler-wrapper'
import { Container, Injectable } from '@nailyjs/ioc'
import { HandlerContext } from '../contexts/handler-context'
import { ControllerScanner } from './controller-scanner'

@Injectable()
export class ControllerMethodExecutor {
  constructor(private readonly controllerScanner: ControllerScanner) {
    if (!controllerScanner) this.controllerScanner = new ControllerScanner(new Container())
  }

  private _backendAdapter: IBackendAdapter
  setBackendAdapter(backendAdapter: IBackendAdapter): this {
    this._backendAdapter = backendAdapter
    return this
  }

  getBackendAdapter(): IBackendAdapter {
    return this._backendAdapter
  }

  private async setupHandler(handler: SingleControllerHandlerWrapper, controllerInstance: Record<string | symbol, any>): Promise<void> {
    const adapter = this.getBackendAdapter()
    await adapter.setupHandle(new HandlerContext(controllerInstance, handler))
  }

  private async setupHandlers(controllerWrapper: RestControllerWrapper): Promise<void> {
    const handlers = controllerWrapper.getControllerHandlerMetadata()
    const controllerInstance = controllerWrapper
      .getClassWrapper()
      .getClassFactory()
      .getOrCreateInstance()

    for (const handler of handlers)
      await this.setupHandler(handler, controllerInstance)
  }

  async setup(): Promise<void> {
    const controllers = this.controllerScanner.scanRestController()
    for (const controller of controllers) await this.setupHandlers(controller)
  }
}
