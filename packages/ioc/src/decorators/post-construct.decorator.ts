import type { CallType, PostConstructMetadata } from '../types'
import { PostConstructWatermark } from '../constant'

export function PostConstruct(callType: CallType = 'parallel'): MethodDecorator {
  return ((target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(PostConstructWatermark, [
      ...(Reflect.getMetadata(PostConstructWatermark, target) || []),
      {
        propertyKey,
        callType,
      },
    ] as PostConstructMetadata[], target.constructor)
  }) as MethodDecorator
}
