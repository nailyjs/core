import { parse } from 'cookie'
import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators'

@Pipe()
export class InternalCookiesPipe implements Pipe {
  transform(_value: undefined, context: IPipeContext): Record<string, string | undefined> | string {
    const handler = context.getHandler()
    const metadata = context.getMetadata()
    const parameterIndex = metadata.getParameterIndex()
    const designParamTypes = handler.getDesignParamTypes()
    const inferString = metadata.getInfer()
    const designType = designParamTypes[parameterIndex]

    const cookieString = context.getRequest().headers.get('cookie')
    const parsedCookies = cookieString ? parse(cookieString) : {}

    if (designType === String && !inferString) return cookieString || ''
    else if (inferString) return parsedCookies[inferString] || ''
    else return parsedCookies
  }
}
