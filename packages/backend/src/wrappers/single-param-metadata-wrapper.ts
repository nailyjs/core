import type { Pipe } from '../decorators/pipe.decorator'
import { Class } from '@nailyjs/ioc'
import { HandlerParamDecorate, HandlerParamMetadata } from '../types'

export class SingleParamMetadataWrapper {
  constructor(private readonly handlerParamMetadata: HandlerParamMetadata) {}

  getDecorate(): keyof HandlerParamDecorate {
    return this.handlerParamMetadata.decorate
  }

  getParameterIndex(): number {
    return this.handlerParamMetadata.parameterIndex
  }

  getPropertyKey(): string | symbol {
    return this.handlerParamMetadata.propertyKey
  }

  getPipes(): readonly Class<Pipe>[] {
    return this.handlerParamMetadata.pipes || []
  }

  getInfer(): string | undefined {
    return this.handlerParamMetadata.infer
  }
}
