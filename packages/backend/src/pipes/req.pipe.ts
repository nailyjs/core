import type { IHandlerRequest } from '../handler-request'
import type { ValueOf } from '../types'
import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalReqPipe implements Pipe {
  transform(_value: undefined, context: IPipeContext): IHandlerRequest | ValueOf<Request> {
    const inferString = context.getMetadata().getInfer()

    if (inferString) return context.getRequest()[inferString]
    return context.getRequest()
  }
}
