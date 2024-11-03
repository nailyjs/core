import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalBodyFormDataPipe implements Pipe {
  transform(_value: undefined, context: IPipeContext): Promise<any> {
    const request = context.getRequest()
    return request.formData()
  }
}
