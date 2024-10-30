import { Get, RestController } from '@nailyjs/backend'
import { CacheProvider } from '@nailyjs/cache'

@RestController()
export class TestController {
  constructor(private readonly cache: CacheProvider) {}

  @Get()
  getString(): string {
    return 'Hello World'
  }
}
