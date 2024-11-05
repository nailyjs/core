import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalSessionPipe implements Pipe {
  transform(_value: undefined, context: IPipeContext): string | null {
    const request: Request = context.getRequest()
    return request.headers.get('session')
  }
}
