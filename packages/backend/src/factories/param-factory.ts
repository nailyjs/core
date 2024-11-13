import type { Pipe } from '../decorators/pipe.decorator'
import { Class } from '@nailyjs/ioc'
import { RestfulControllerHandlerParameterWatermark } from '../constant'
import { CreateRestControllerParamDecoratorOnDecorateContext, ICreateRestControllerParamDecoratorOnDecorateContext } from '../contexts/create-param-decorator-context'
import { HandlerParamDecorate, HandlerParamMetadata } from '../types'

export interface CreateRestControllerParamDecoratorOptions {
  decorate: keyof HandlerParamDecorate
  onDecorate?(
    ctx: ICreateRestControllerParamDecoratorOnDecorateContext,
    args: Parameters<CreateRestControllerParamDecoratorReturn>,
  ): ParameterDecorator | void
}

export interface CreateRestControllerParamDecoratorReturn {
  (...pipes: Class<Pipe>[]): ParameterDecorator
  (infer: string, ...pipes: Class<Pipe>[]): ParameterDecorator
}

export function createRestControllerParamDecorator(options: CreateRestControllerParamDecoratorOptions): CreateRestControllerParamDecoratorReturn {
  return (...args: any[]) => {
    return ((target: Object, propertyKey: string | symbol, parameterIndex: number) => {
      const decorateContext = new CreateRestControllerParamDecoratorOnDecorateContext({
        decorate: options.decorate,
        parameterIndex,
        propertyKey,
        pipes: typeof args[0] === 'string' ? args.slice(1) : args,
        infer: typeof args[0] === 'string' ? args[0] : undefined,
      })

      if (options && options.onDecorate) {
        const decorator = options.onDecorate(decorateContext, args as Parameters<CreateRestControllerParamDecoratorReturn>)
        if (decorator) decorator(target, propertyKey, parameterIndex)
      }
      Reflect.defineMetadata(RestfulControllerHandlerParameterWatermark, [
        ...(Reflect.getMetadata(RestfulControllerHandlerParameterWatermark, target.constructor === Function ? target : target.constructor) || []),
        decorateContext.getMetadata(),
      ] as HandlerParamMetadata[], target.constructor === Function ? target : target.constructor)
    }) as ParameterDecorator
  }
}
