import { RestErrorHandler, RestFilterContext } from '@nailyjs/backend'
import { Filter } from '@nailyjs/ioc'
import { ZodError } from 'zod'

@Filter(ZodError)
export class ZodFilter implements RestErrorHandler {
  catch(error: ZodError, ctx: RestFilterContext): any {
    ctx.sendResponse(new Response(JSON.stringify({
      message: 'ValidationError',
      cause: error,
    }), { status: 400 }))
  }
}
