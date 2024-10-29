import type { InjectOptions } from './decorators'

export class InjectWrapper {
  constructor(private readonly injectOptions: Partial<InjectOptions>) {}

  getInjectOptions(): Partial<InjectOptions> {
    const result = this.injectOptions
    if (!result.injectionToken) {
      const designType = Reflect.getMetadata('design:type', result.currentTarget.constructor, result.currentProperty)
      if (designType && typeof designType === 'function')
        result.injectionToken = designType
    }
    return result
  }
}
