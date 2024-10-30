import { Catch, Filter, Finally } from '@nailyjs/ioc'
import { HandlerContext } from '../src/handler-context'

it('test abstract handler context', () => {
  @Filter()
  class TestCatchError {
    @Catch()
    hello(error: TypeError) {
      console.log('Hello, world!', error.name)
    }

    @Finally()
    async world() {
      console.log('Hello world! finally')
    }
  }

  class TestHandlerContext extends HandlerContext {
    async callback(): Promise<any> {
      let currentError: unknown
      try {
        throw new TypeError('Test error')
      }
      catch (error) {
        currentError = error
        await this.catchError(error)
      }
      finally { await this.catchFinally(currentError) }
    }

    async catchError(error: unknown): Promise<void> {
      await this.eachErrorHandler(async (target, methodKey) => {
        await target[methodKey](error)

        expect(target).toBeInstanceOf(TestCatchError)
        expect(methodKey).toBe('hello')
      }, error)
    }

    async catchFinally(currentError: unknown | undefined): Promise<void> {
      await this.eachFinallyHandler(async (target, methodKey) => {
        await target[methodKey](currentError)

        expect(target).toBeInstanceOf(TestCatchError)
        expect(methodKey).toBe('world')
      }, currentError)
    }
  }

  new TestHandlerContext().callback()
})
