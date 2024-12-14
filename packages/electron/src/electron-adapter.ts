import { HandlerRequest, IBackendAdapter, IHandlerContext } from '@nailyjs/backend'
import { ipcMain } from 'electron'

export class ElectronAdapter implements IBackendAdapter {
  constructor(
    private handlerToken: string = '__naily:electron:rpc__',
    private baseURL: string | URL = new URL('rpc:///rpc'),
  ) {}

  listen(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  setHandlerToken(token: string): this {
    this.handlerToken = token
    return this
  }

  getHandlerToken(): string {
    return this.handlerToken
  }

  setBaseURL(url: string | URL): this {
    this.baseURL = new URL(url)
    return this
  }

  getBaseURL(): string | URL {
    return this.baseURL
  }

  setupHandle(handlerContext: IHandlerContext): void | Promise<void> {
    ipcMain.handle(this.handlerToken, async (e, data) => {
      let result: any = data
      try {
        result = JSON.stringify(data)
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (_) {
        result = data
      }

      const request = new HandlerRequest(this.baseURL, {
        method: 'POST',
        body: result,
      })
      const response = await handlerContext.handle(request)
      return await response.text()
    })
  }
}
