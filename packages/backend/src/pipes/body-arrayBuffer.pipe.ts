import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalBodyArrayBufferPipe implements Pipe {
  async transform(_value: undefined, context: IPipeContext): Promise<ArrayBuffer> {
    const request = context.getRequest()
    return request.arrayBuffer()
  }
}
