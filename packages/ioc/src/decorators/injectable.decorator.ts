import type { Class, ConfigurableInjectableOptions, InjectableOptions, InjectionToken } from '../types'
import { InjectableWatermark } from '../constant'
import { ClassWrapper } from '../wrappers/class-wrapper'

export function Injectable(options: Partial<ConfigurableInjectableOptions> = {}): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(InjectableWatermark, options || { decorate: 'Injectable' } as InjectableOptions, target)
    new ClassWrapper(target).save()
  }) as ClassDecorator
}

export function Service(injectionToken?: InjectionToken, options?: Omit<Partial<ConfigurableInjectableOptions>, 'injectionToken'>): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(InjectableWatermark, { ...options, injectionToken, decorate: 'Service' } as InjectableOptions, target)
    new ClassWrapper(target).save()
  }) as ClassDecorator
}

export function Component(injectionToken?: InjectionToken, options?: Omit<Partial<ConfigurableInjectableOptions>, 'injectionToken'>): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(InjectableWatermark, { ...options, injectionToken, decorate: 'Component' } as InjectableOptions, target)
    new ClassWrapper(target).save()
  }) as ClassDecorator
}

export function Configuration(injectionToken?: InjectionToken, options?: Omit<Partial<ConfigurableInjectableOptions>, 'injectionToken'>): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(InjectableWatermark, { ...options, injectionToken, decorate: 'Configuration' } as InjectableOptions, target)
    new ClassWrapper(target).save()
  }) as ClassDecorator
}
