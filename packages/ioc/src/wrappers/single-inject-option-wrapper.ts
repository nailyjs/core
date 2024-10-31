import type { Container } from '../container'
import type { MetadataScanner } from '../metadata-scanner'
import type { ClassWrapperProvider, GetInjectionTokenable } from '../protocols'
import type { InjectionToken, InjectOptions } from '../types'
import type { ClassWrapper } from './class-wrapper'
import type { InjectMetadataWrapper } from './inject-options-wrapper'

export class SingleInjectOptionWrapper implements ClassWrapperProvider, GetInjectionTokenable {
  constructor(
    private readonly injectMetadataWrapper: InjectMetadataWrapper,
    private readonly singleInjectOptions: InjectOptions,
  ) {}

  getClassWrapper(): ClassWrapper {
    return this.injectMetadataWrapper.getClassWrapper()
  }

  getGlobalContainer(): Container {
    return this.injectMetadataWrapper.getGlobalContainer()
  }

  getMetadataScanner(): MetadataScanner {
    return this.injectMetadataWrapper.getMetadataScanner()
  }

  getInjectMetadataWrapper(): InjectMetadataWrapper {
    return this.injectMetadataWrapper
  }

  getSingleInjectOptions(): InjectOptions {
    return this.singleInjectOptions
  }

  isOptional(): boolean {
    return this.getSingleInjectOptions().optional === true
  }

  isRequired(): boolean {
    return !this.isOptional()
  }

  isConstructorInjection(): boolean {
    return typeof this.getSingleInjectOptions().parameterIndex === 'number'
  }

  isPropertyInjection(): boolean {
    return (typeof this.getSingleInjectOptions().propertyKey === 'string' || typeof this.getSingleInjectOptions().propertyKey === 'symbol')
      && typeof this.getSingleInjectOptions().parameterIndex !== 'number'
  }

  getParameterIndex(): number | undefined {
    return this.getSingleInjectOptions().parameterIndex
  }

  getPropertyKey(): string | symbol | undefined {
    return this.getSingleInjectOptions().propertyKey
  }

  getInjectionToken(): InjectionToken | undefined {
    return this.getSingleInjectOptions().injectionToken
  }
}
