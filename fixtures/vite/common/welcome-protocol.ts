import type { User } from '../backend/models/user.model'

export const WelcomeServer = 'WelcomeServer'
export interface WelcomeServer {
  sayHello(name: string): Promise<User[]>
  testResponse(url: string): Promise<Response>
}
