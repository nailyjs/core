import { Rule } from '@nailyjs/zod'
import { z } from 'zod'

export class GetQueryDTO extends URLSearchParams {
  @Rule(z.array(z.string()).or(z.string()))
  name: string
}
