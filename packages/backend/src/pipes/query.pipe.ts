import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalQueryPipe implements Pipe {
  transform(_value: undefined, context: IPipeContext): URLSearchParams | Record<string, string> {
    const handler = context.getHandler()
    const metadata = context.getMetadata()
    const parameterIndex = metadata.getParameterIndex()
    const paramType = handler.getDesignParamTypes()[parameterIndex]

    const searchParams = new URL(context.getRequest().url).searchParams
    if (paramType === Object) return Object.fromEntries(searchParams)
    else return searchParams
  }
}
