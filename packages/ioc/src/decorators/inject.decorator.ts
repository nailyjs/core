import type { InjectionToken } from '../types'
import { InjectSymbol } from '../constants/constant'
import { Container } from '../container'
import { InjectWrapper } from '../inject-wrapper'

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
    // eslint-disable-next-line dot-notation
    Container['markedInject'].add(new InjectWrapper(metadata))
  }) as PropertyDecorator & ParameterDecorator
}

export function Autowired(injectionToken?: InjectionToken, extraOptions: Omit<Partial<InjectOptions>, 'injectionToken'> = {}): PropertyDecorator & ParameterDecorator {
  return Inject({
    ...(extraOptions || {}),
    injectionToken,
  })
}
