import type { ControllerHandlerOptions, HttpMethod } from '../types'
import type { RestControllerWrapper } from './controller-wrapper'
import { match } from 'path-to-regexp'

export class SingleControllerHandlerWrapper {
  constructor(
    private readonly controller: RestControllerWrapper,
    private readonly options: ControllerHandlerOptions,
  ) {}

  getController(): RestControllerWrapper {
    return this.controller
  }

  getHttpMethod(): HttpMethod {
    return this.options.method
  }

  getPath(): string {
    return this.options.path
  }

  getPropertyKey(): string | symbol {
    return this.options.propertyKey
  }

  getMergedPath(): string {
    const controllerPath = this.controller.getControllerPrefix()
    const handlerPath = this.getPath()
    return this.controller.mergePathnames(controllerPath, handlerPath)
  }

  isMatched(path: string): boolean {
    return match(this.getMergedPath())(path) !== false
  }

  getMatchedParams(path: string): Partial<Record<string, string | string[]>> {
    const matched = match(this.getMergedPath())(path)
    if (!matched) return {}
    return matched.params
  }

  getDesignParamTypes(): any[] {
    return this.controller
      .getClassWrapper()
      .getMetadataScanner()
      .getMethodParamTypes(this.getPropertyKey()) || []
  }
}
