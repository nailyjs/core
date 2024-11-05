import type { Class, FilterParamDecorate, FilterParamExecutor, FilterParamMetadata } from './types'

export interface ICreateFilterParamDecoratorOnDecorateContext {
  getParameterIndex(): number
  getPropertyKey(): string | symbol
  getDecorate(): keyof FilterParamDecorate
  getArgs(): any[]
  getMetadata(): FilterParamMetadata
  getExecutor(): Class<FilterParamExecutor>
}

export class CreateFilterParamDecoratorOnDecorateContext implements ICreateFilterParamDecoratorOnDecorateContext {
  constructor(private readonly options: FilterParamMetadata) {}

  getParameterIndex(): number {
    return this.options.parameterIndex
  }

  getPropertyKey(): string | symbol {
    return this.options.propertyKey
  }

  getDecorate(): keyof FilterParamDecorate {
    return this.options.decorate
  }

  getArgs(): any[] {
    return this.options.args
  }

  getMetadata(): FilterParamMetadata {
    return this.options
  }

  getExecutor(): Class<FilterParamExecutor> {
    return this.options.executor
  }

  setExecutor(executor: Class<FilterParamExecutor>): void {
    this.options.executor = executor
  }
}
