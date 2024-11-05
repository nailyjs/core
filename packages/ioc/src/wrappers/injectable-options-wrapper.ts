import type { MetadataScanner } from '../metadata-scanner'
import type { ClassWrapperProvider } from '../protocols'
import type { InjectableDecorate, InjectableOptions, InjectionToken, Scope } from '../types'
import { InjectableWatermark } from '../constant'
import { AbstractClassWrapperProvider } from './class-wrapper-provider'
import 'reflect-metadata'

export class InjectableMetadataWrapper extends AbstractClassWrapperProvider implements ClassWrapperProvider {
  constructor(private readonly metadataScanner: MetadataScanner) {
    super(
      metadataScanner.getClassWrapper().getGlobalContainer(),
      metadataScanner.getClassWrapper(),
    )
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

  getDecorate(): InjectableDecorate {
    return this.getRawInjectableOptions().decorate || 'Injectable'
  }

  isInjectableDecorator(): boolean {
    return this.getDecorate() === 'Injectable'
  }

  isServiceDecorator(): boolean {
    return this.getDecorate() === 'Service'
  }

  isComponentDecorator(): boolean {
    return this.getDecorate() === 'Component'
  }

  isConfigurationDecorator(): boolean {
    return this.getDecorate() === 'Configuration'
  }

  isSingleton(): boolean {
    return this.getScope() === 'singleton'
  }

  isTransient(): boolean {
    return this.getScope() === 'transient'
  }
}
