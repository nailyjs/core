import { Get, RestController } from '@nailyjs/backend'
import { Value } from '@nailyjs/config'

@RestController()
export class TestController {
  @Value('1 + 1')
  private readonly hello: string

  @Get()
  getString(): string {
    return 'Hello World'
  }
}
