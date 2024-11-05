import type { ErrorHandler, ErrorHandlerContext, InjectionToken } from './types'
import type { ClassWrapper } from './wrappers/class-wrapper'
import { ConfigureErrorHandlerContext } from './configure-error-handler-context'
import { ConfigureErrorHandler } from './constant'
import { Container } from './container'

export class ErrorHandlerFactory {
  constructor(private readonly container?: Container) {}

  private getGlobalContainer(): Container {
    if (!this.container) return new Container()
    return this.container
  }

  private getConfigureErrorHandler(): ConfigureErrorHandler | null {
    const configureErrorHandler: ClassWrapper<ConfigureErrorHandler> = this.getGlobalContainer().getContainer().get(ConfigureErrorHandler) as ClassWrapper<ConfigureErrorHandler>
    if (!configureErrorHandler) return null
    if (configureErrorHandler && configureErrorHandler.wrapperType !== 'class')
      throw new Error('ConfigureErrorHandler must be a class.')
    return configureErrorHandler.getClassFactory().getOrCreateInstance()
  }

  private getErrorHandlers(): [InjectionToken, ClassWrapper][] {
    return Array.from(this.getGlobalContainer().getContainer())
      .reverse()
      .filter(([_injectionToken, wrapper]) => {
        return wrapper.wrapperType === 'class' && wrapper.getMetadataScanner().isFilter()
      }) as [InjectionToken, ClassWrapper][]
  }

  async getConfiguredErrorHandlers(): Promise<ClassWrapper<ErrorHandler>[]> {
    const errorHandlers = Array.from(new Map(this.getErrorHandlers()).values())
    const configureErrorHandler = this.getConfigureErrorHandler()
    if (configureErrorHandler && configureErrorHandler.configure && typeof configureErrorHandler.configure === 'function')
      await configureErrorHandler.configure(new ConfigureErrorHandlerContext(errorHandlers))
    return errorHandlers
  }

  async catch(currentError: unknown, context: ErrorHandlerContext): Promise<void> {
    const errorHandlers = await this.getConfiguredErrorHandlers()

    for (const errorHandler of errorHandlers) {
      const filteredErrors: any[] = errorHandler
        .getMetadataScanner()
        .getFilterMetadata()
        .getFilterErrors()

      if (filteredErrors.length === 0) {
        const instance = errorHandler.getClassFactory().getOrCreateInstance() as ErrorHandler
        if (instance.catch && typeof instance.catch === 'function')
          await instance.catch(currentError, context)
      }

      for (const instanceOfError of filteredErrors) {
        if (currentError === instanceOfError || currentError instanceof instanceOfError) {
          const instance = errorHandler.getClassFactory().getOrCreateInstance() as ErrorHandler
          if (instance.catch && typeof instance.catch === 'function')
            await instance.catch(currentError, context)
        }
      }
    }
  }
}
