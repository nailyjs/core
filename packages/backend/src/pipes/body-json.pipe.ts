import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalBodyJsonPipe implements Pipe {
  async transform(_value: undefined, context: IPipeContext): Promise<any> {
    return context.getRequest().json()
  }
}
