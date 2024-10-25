import { createRpcClient } from '@nailyjs/rpc/axios'
import { WelcomeServer } from '../common/welcome-protocol'

const client = createRpcClient()

client.request<WelcomeServer>(WelcomeServer)
  .add(1, 2)
  .then(result => console.log(result)) // 3
