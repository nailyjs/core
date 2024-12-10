import { BackendBootstrap } from '@nailyjs/backend'
import { ElectronAdapter } from './electron-adapter'

export class ElectronBootstrap extends BackendBootstrap {
  private handlerToken: string = '__naily:electron:rpc__'
  private baseURL: string | URL = new URL('rpc:///rpc')

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

  public override async run(port: number, callback?: () => any): Promise<any> {
    this.setBackendAdapter(new ElectronAdapter(this.handlerToken, this.baseURL))
    return super.run(port, callback)
  }
}
