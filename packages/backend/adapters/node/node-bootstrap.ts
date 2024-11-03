import { BackendBootstrap } from '../../src'
import { NodeAdapter } from './node-adapter'

export class NodeBootstrap extends BackendBootstrap {
  public override async run(port: number, callback?: () => any): Promise<any> {
    this.setBackendAdapter(new NodeAdapter())
    return super.run(port, callback)
  }
}
