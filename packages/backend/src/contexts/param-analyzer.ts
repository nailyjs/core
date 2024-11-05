import type { Pipe } from '../decorators'
import type { IHandlerRequest } from '../handler-request'
import { Class } from '@nailyjs/ioc'
import { RestfulControllerHandlerParameterWatermark } from '../constant'
import { HandlerParamMetadata } from '../types'
import { SingleControllerHandlerWrapper, SingleParamMetadataWrapper } from '../wrappers'
import { PipeContext } from './pipe-context'

export class ParamAnalyzer {
  constructor(private readonly handler: SingleControllerHandlerWrapper) {}

  private async runPipes(value: any, pipeContext: PipeContext, pipes: Class<Pipe>[]): Promise<any> {
    for (const pipe of pipes) {
      const pipeInstance: Pipe = this.handler
        .getController()
        .getClassWrapper()
        .getGlobalContainer()
        .createClassWrapper(pipe)
        .save()
        .getClassFactory()
        .getOrCreateInstance()

      if (!pipeInstance.transform || typeof pipeInstance.transform !== 'function') continue
      const result = await pipeInstance.transform(value, pipeContext)
      if (result === undefined || result === null) continue
      value = result
    }
    return value
  }

  public async getParameters(propertyKey: string | symbol, request: IHandlerRequest): Promise<any[]> {
    const params = []
    const parameterMetadata: HandlerParamMetadata[] = this.handler
      .getController()
      .getClassWrapper()
      .getMetadata(RestfulControllerHandlerParameterWatermark) || []

    for (const metadata of parameterMetadata) {
      if (metadata.propertyKey !== propertyKey) continue
      if (metadata.pipes && Array.isArray(metadata.pipes) && metadata.pipes.length > 0) {
        const result = await this.runPipes(
          params[metadata.parameterIndex],
          new PipeContext(
            this.handler,
            new SingleParamMetadataWrapper(metadata),
            request,
          ),
          metadata.pipes,
        )
        if (result === undefined || result === null) continue
        params[metadata.parameterIndex] = result
      }
    }

    return params
  }
}
