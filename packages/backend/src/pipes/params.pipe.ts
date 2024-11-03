import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalParamsPipe implements Pipe {
  transform(_value: undefined, context: IPipeContext): Partial<Record<string, string | string[]>> {
    const handler = context.getHandler()
    const request = context.getRequest()

    return handler.getMatchedParams(new URL(request.url).pathname)
  }
}
