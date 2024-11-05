import type { ClassWrapper } from '../src'
import { Filter, Injectable, PostConstruct } from '../src'
import { AbstractBootstrap } from '../src/bootstrap'

describe('error & filter', () => {
  it('should throw error', async () => {
    @Filter()
    class _ErrorFilter {
      catchAll(error: any) {
        console.log('catchAll called')
        console.error(error)
      }
    }

    @Injectable()
    class FooService {
      @PostConstruct()
      postConstructFunc() {
        console.log('postConstructFunc called')
        throw new Error('parent error')
      }
    }

    class Bootstrap extends AbstractBootstrap {
      async run(): Promise<any> {
        const fooService = this.getContainer().get(FooService) as ClassWrapper
        expect(fooService).toBeDefined()
        expect(fooService.wrapperType).toBe('class')
        fooService.getClassFactory().getOrCreateInstance()
      }
    }
    await new Bootstrap().run()
  })
})
