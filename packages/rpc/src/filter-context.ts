import { ErrorHandler, ErrorHandlerContext, ErrorHandlerContextType } from '@nailyjs/ioc'
import { randomUUID } from './utils'

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

  sendResponse(response: Response): void {
    this._response = response
  }

  getResponse(): Response | null {
    return this._response
  }

  sendSuccess<Data>(data: Data): void {
    this.sendResponse(new Response(JSON.stringify({
      jsonrpc: '2.0',
      result: data,
      id: randomUUID(),
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    }))
  }

  sendError<Data>(code: number, message: string, data: Data): void {
    this.sendResponse(new Response(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code,
        message,
        data,
      },
      id: randomUUID(),
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    }))
  }
}
