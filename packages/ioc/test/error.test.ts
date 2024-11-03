import type { ClassWrapper } from '../src'
import { Injectable, PostConstruct } from '../src'
import { AbstractBootstrap } from '../src/bootstrap'

describe('error & filter', () => {
  it('should throw error', async () => {
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
        this.enableInternalConstant()

        const fooService = this.getContainer().get(FooService) as ClassWrapper
        expect(fooService).toBeDefined()
        expect(fooService?.wrapperType).toBe('class')
        fooService.getClassFactory().getOrCreateInstance()
      }
    }
    await new Bootstrap().run()
  })
})
