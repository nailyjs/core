import { ErrorHandler, ErrorHandlerContext, ErrorHandlerContextType } from '@nailyjs/ioc'

declare module '@nailyjs/ioc' {
  interface ErrorHandlerContextType {
    readonly RpcFilterContext: unique symbol
  }
}

export interface RpcErrorHandler extends ErrorHandler {
  catch(error: any, ctx: RpcFilterContext): any
}

export class RpcFilterContext implements ErrorHandlerContext {
  contextType: keyof ErrorHandlerContextType = 'RpcFilterContext'

  private _response: Response | null = null

  setResponse(response: Response): void {
    this._response = response
  }

  getResponse(): Response | null {
    return this._response
  }
}
