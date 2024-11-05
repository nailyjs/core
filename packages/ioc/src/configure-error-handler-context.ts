import type { ErrorHandler } from './types'
import type { ClassWrapper } from './wrappers/class-wrapper'

export interface IConfigureErrorHandlerContext {
  getErrorHandlerWrappers(): ClassWrapper<ErrorHandler>[]
  setErrorHandlerWrappers(wrappers: ClassWrapper<ErrorHandler>[]): this
}

export class ConfigureErrorHandlerContext implements IConfigureErrorHandlerContext {
  constructor(private wrappers: ClassWrapper[]) {}

  getErrorHandlerWrappers(): ClassWrapper<ErrorHandler>[] {
    return this.wrappers
  }

  setErrorHandlerWrappers(wrappers: ClassWrapper<ErrorHandler>[]): this {
    this.wrappers = wrappers
    return this
  }
}
