/* eslint-disable ts/consistent-type-imports */

import { Get, RestController } from '@nailyjs/backend'
import { Value } from '@nailyjs/config'
import { Autowired } from '@nailyjs/ioc'
import { JexlExecutor } from '@nailyjs/jexl'

@RestController()
export class TestController {
  @Value('1 + 1')
  private readonly hello: string

  @Autowired()
  private readonly jexl: JexlExecutor

  @Get()
  getString(): string {
    return 'Hello World'
  }
}
