import { Get, Query, RestController } from '@nailyjs/backend'
import { ValidationPipe } from '@nailyjs/zod'
import { GetQueryDTO } from './app.dto'

@RestController()
export class AppController {
  @Get()
  getHello(@Query(ValidationPipe) query: GetQueryDTO): any {
    return `Hello ${query}!`
  }
}
