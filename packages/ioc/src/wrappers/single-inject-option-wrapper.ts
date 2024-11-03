import type { GetInjectionTokenable } from '../protocols'
import type { InjectionToken, InjectOptions } from '../types'
import type { InjectMetadataWrapper } from './inject-options-wrapper'
import { AbstractClassWrapperProvider } from './class-wrapper-provider'

export class SingleInjectOptionWrapper extends AbstractClassWrapperProvider implements GetInjectionTokenable {
  constructor(
    private readonly injectMetadataWrapper: InjectMetadataWrapper,
    private readonly singleInjectOptions: InjectOptions,
  ) {
    super(
      injectMetadataWrapper.getGlobalContainer(),
      injectMetadataWrapper.getClassWrapper(),
    )
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
