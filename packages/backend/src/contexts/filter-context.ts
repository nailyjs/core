import type { IHandlerRequest } from '../handler-request'
import { ErrorHandlerContext, ErrorHandlerContextType } from '@nailyjs/ioc'

export interface IFilterContext {
  getRequest(): IHandlerRequest
  sendResponse(response: Response): void
}

declare module '@nailyjs/ioc' {
  interface ErrorHandlerContextType {
    readonly RestFilterContext: unique symbol
  }
}

export class RestFilterContext implements ErrorHandlerContext {
  constructor(
    private readonly request: IHandlerRequest,
  ) {}

  contextType: keyof ErrorHandlerContextType = 'RestFilterContext'

  getRequest(): IHandlerRequest {
    return this.request
  }

  private _response: Response | null = null
  sendResponse(response: Response): void {
    this._response = response
  }

  getResponse(): Response | null {
    return this._response
  }
}
