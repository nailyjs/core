import type { InjectionToken } from '../types'
import { InjectSymbol } from '../constants/constant'
import { MarkedInject } from '../constants/container-constant'

export interface InjectOptions {
  injectionToken: InjectionToken
  currentProperty: string | symbol
  currentTarget: object
}

export function Inject(options?: Partial<InjectOptions>): PropertyDecorator & ParameterDecorator {
  return ((target: object, propertyKey: string | symbol | undefined) => {
    const metadata: Partial<InjectOptions> = {
      ...(options || {}),
      currentProperty: propertyKey,
      currentTarget: target,
    }
    Reflect.defineMetadata(InjectSymbol, metadata, target.constructor, propertyKey)
    MarkedInject.add(metadata)
  }) as PropertyDecorator & ParameterDecorator
}

export function Autowired(injectionToken?: InjectionToken, extraOptions: Omit<Partial<InjectOptions>, 'injectionToken'> = {}): PropertyDecorator & ParameterDecorator {
  return Inject({
    ...(extraOptions || {}),
    injectionToken,
  })
}
