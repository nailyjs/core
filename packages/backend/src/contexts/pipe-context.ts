import { IHandlerRequest } from '../handler-request'
import { SingleControllerHandlerWrapper } from '../wrappers/single-controller-handler-wrapper'
import { SingleParamMetadataWrapper } from '../wrappers/single-param-metadata-wrapper'

export interface IPipeContext {
  getHandler(): SingleControllerHandlerWrapper
  getMetadata(): SingleParamMetadataWrapper
  getRequest(): IHandlerRequest
  setRequest(request: IHandlerRequest): void
}

export class PipeContext implements IPipeContext {
  constructor(
    private readonly handler: SingleControllerHandlerWrapper,
    private readonly metadata: SingleParamMetadataWrapper,
    private request: IHandlerRequest,
  ) {}

  getHandler(): SingleControllerHandlerWrapper {
    return this.handler
  }

  getMetadata(): SingleParamMetadataWrapper {
    return this.metadata
  }

  getRequest(): Request {
    return this.request
  }

  setRequest(request: Request): void {
    this.request = request
  }
}
