import { ClassWrapper, Container, Injectable } from '@nailyjs/ioc'
import { RpcControllerMetadataWatermark } from './rpc.controller'
import { SingleRpcControllerWrapper } from './single-rpc-controller-wrapper'

@Injectable()
export class RpcControllerScanner {
  constructor(private readonly container: Container) {
    if (!container) this.container = new Container()
  }

  getRpcControllerClassWrappers(): ClassWrapper[] {
    const wrappers = this.container.getContainer()
    const controllerWrappers: ClassWrapper[] = []

    for (const [_injectionToken, wrapper] of wrappers) {
      if (wrapper.wrapperType !== 'class') continue
      if (wrapper.hasMetadata(RpcControllerMetadataWatermark))
        controllerWrappers.push(wrapper)
    }

    return controllerWrappers
  }

  getRpcControllerWrapper(): SingleRpcControllerWrapper[] {
    return this.getRpcControllerClassWrappers()
      .map(wrapper => new SingleRpcControllerWrapper(this, wrapper))
  }
}
