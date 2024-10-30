import { RpcController } from '@nailyjs/rpc'
import { WelcomeServer } from '../common/welcome-protocol'

@RpcController(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
  add(a: number, b: number): number {
    return a + b
  }
}
