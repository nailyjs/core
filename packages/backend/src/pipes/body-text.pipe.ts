import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalBodyTextPipe implements Pipe {
  async transform(_value: undefined, context: IPipeContext): Promise<string> {
    const request = context.getRequest()
    return request.text()
  }
}
