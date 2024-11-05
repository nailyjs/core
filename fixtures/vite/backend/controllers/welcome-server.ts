import { Value } from '@nailyjs/config'
import { RpcController } from '@nailyjs/rpc'
import { DataSource } from 'typeorm'
import { WelcomeServer } from '../../common/welcome-protocol'
import { User } from '../models/user.model'

@RpcController(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
  constructor(private readonly dataSource: DataSource) {}

  @Value('naily')
  private readonly naily: object

  async sayHello(): Promise<User[]> {
    return this.dataSource.getRepository(User).find()
  }
}
