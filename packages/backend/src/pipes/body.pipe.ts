import { get } from 'lodash-es'
import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators/pipe.decorator'

@Pipe()
export class InternalBodyPipe implements Pipe {
  async transformWithParamType(paramType: unknown, context: IPipeContext): Promise<Blob | string | ArrayBuffer | FormData | Record<string, any>> {
    const request = context.getRequest()
    const inferString = context.getMetadata().getInfer()

    switch (paramType) {
      case Blob:
        return await request.blob()
      case String:
        return await request.text()
      case ArrayBuffer:
        return await request.arrayBuffer()
      case FormData:
        return await request.formData()
      default:
        return inferString ? get(await request.json(), inferString) : await request.json()
    }
  }

  async transform(_value: undefined, context: IPipeContext): Promise<any> {
    const handler = context.getHandler()
    const parameterIndex = context.getMetadata().getParameterIndex()
    const currentParamType = handler.getDesignParamTypes()[parameterIndex]
    return await this.transformWithParamType(currentParamType, context)
  }
}
