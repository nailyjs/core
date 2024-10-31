import type { Container } from '../container'
import type { MetadataScanner } from '../metadata-scanner'
import type { ClassWrapperProvider } from '../protocols'
import type { InjectableOptions, InjectionToken, Scope } from '../types'
import type { ClassWrapper } from './class-wrapper'
import { InjectableWatermark } from '../constant'
import 'reflect-metadata'

export class InjectableMetadataWrapper implements ClassWrapperProvider {
  constructor(private readonly metadataScanner: MetadataScanner) {}

  getMetadataScanner(): MetadataScanner {
    return this.metadataScanner
  }

  getClassWrapper(): ClassWrapper {
    return this.getMetadataScanner().getClassWrapper()
  }

  getGlobalContainer(): Container {
    return this.getClassWrapper().getGlobalContainer()
  }

  getRawInjectableOptions(): Partial<InjectableOptions> {
    return Reflect.getMetadata(InjectableWatermark, this.getClassWrapper().getTarget()) || {}
  }

  getInjectionToken(): InjectionToken {
    return this.getRawInjectableOptions().injectionToken || this.getClassWrapper().getTarget()
  }

  getScope(): Scope {
    return this.getRawInjectableOptions().scope || 'singleton'
  }

  isSingleton(): boolean {
    return this.getScope() === 'singleton'
  }

  isTransient(): boolean {
    return this.getScope() === 'transient'
  }
}
