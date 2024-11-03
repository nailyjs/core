import { Class } from '@nailyjs/ioc'
import { Pipe } from '../decorators/pipe.decorator'
import { HandlerParamDecorate, HandlerParamMetadata } from '../types'

export interface ICreateRestControllerParamDecoratorOnDecorateContext {
  pushPipe(pipe: Class<Pipe>): this
  unshiftPipe(pipe: Class<Pipe>): this
  getParameterIndex(): number
  getPropertyKey(): string | symbol
  getDecorate(): keyof HandlerParamDecorate
  getPipes(): readonly Class<Pipe>[]
  getInfer(): string | undefined
}

export class CreateRestControllerParamDecoratorOnDecorateContext implements ICreateRestControllerParamDecoratorOnDecorateContext {
  constructor(private readonly handlerParamMetadata: HandlerParamMetadata) {}

  pushPipe(pipe: Class): this {
    if (!this.handlerParamMetadata.pipes) this.handlerParamMetadata.pipes = []
    this.handlerParamMetadata.pipes.push(pipe)
    return this
  }

  unshiftPipe(pipe: Class): this {
    if (!this.handlerParamMetadata.pipes) this.handlerParamMetadata.pipes = []
    this.handlerParamMetadata.pipes.unshift(pipe)
    return this
  }

  getMetadata(): HandlerParamMetadata {
    return this.handlerParamMetadata
  }

  getParameterIndex(): number {
    return this.handlerParamMetadata.parameterIndex
  }

  getPropertyKey(): string | symbol {
    return this.handlerParamMetadata.propertyKey
  }

  getDecorate(): keyof HandlerParamDecorate {
    return this.handlerParamMetadata.decorate
  }

  getPipes(): readonly Class[] {
    return this.handlerParamMetadata.pipes || []
  }

  getInfer(): string | undefined {
    return this.handlerParamMetadata.infer
  }
}
