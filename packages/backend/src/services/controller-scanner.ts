import type { ControllerOptions } from '../types'
import { Container, Injectable } from '@nailyjs/ioc'
import { RestControllerWatermark } from '../constant'
import { RestControllerWrapper } from '../wrappers/controller-wrapper'

@Injectable()
export class ControllerScanner {
  constructor(private readonly container: Container) {
    if (!container) this.container = new Container()
  }

  scanRestController(): RestControllerWrapper[] {
    const container = this.container.getContainer()

    const scanned: RestControllerWrapper[] = []

    for (const [_InjectionToken, wrapper] of container.entries()) {
      if (wrapper.wrapperType !== 'class') continue
      const controllerMetadata: ControllerOptions = wrapper.getMetadata(RestControllerWatermark)
      if (!controllerMetadata) continue
      scanned.push(new RestControllerWrapper(wrapper))
    }

    return scanned
  }
}
