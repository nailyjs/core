import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalHeaderPipe implements Pipe {
  transform(_value: undefined, context: IPipeContext): Headers {
    return context.getRequest().headers
  }
}
