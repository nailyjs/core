import { Autowired, ClassWrapper, ConstantWrapper, Container, Inject, Injectable, InjectableWatermark, InjectWatermark, Optional, PostConstruct } from '../src'
import { AbstractBootstrap } from '../src/bootstrap'

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

it('should automatic analyze deps', () => {
  @Injectable()
  class BarService {
  }

  @Injectable()
  class FooService {
    constructor(
      barService: BarService,
      @Inject()
      bazService: BarService,
      @Inject()
      @Optional()
      existService: Object,
      @Autowired()
      baz2Service: BarService,
      container: Container,
      @Autowired(InjectableWatermark)
      private readonly injectableWatermark: string,
    ) {
      expect(barService).toBeInstanceOf(BarService)
      expect(bazService).toBeInstanceOf(BarService)
      expect(baz2Service).toBeInstanceOf(BarService)
      expect(container).toBeInstanceOf(Container)
      expect(injectableWatermark).toBe(InjectableWatermark)

      // 属性注入的时候，在constructor 里 thisBarService 还没有被注入
      expect(this.container).toBeUndefined()
      expect(this.injectWatermark).toBeUndefined()
    }

    @Autowired()
    container: Container

    @Autowired(InjectWatermark)
    injectWatermark: string

    @PostConstruct()
    postConstructFunc() {
      // 在 postConstruct 里 thisBarService 已经被注入
      expect(this.container).toBeInstanceOf(Container)
      expect(this.injectWatermark).toBe(InjectWatermark)
    }
  }

  class Bootstrap extends AbstractBootstrap {
    async run(): Promise<any> {
      this.enableInternalConstant()

      const wrapper = this.createClassWrapper(FooService).save()
      expect(wrapper.getMetadataScanner().isInjectable()).toBeTruthy()
      expect(wrapper.getMetadataScanner().isFilter()).toBeFalsy()
      const classFactory = wrapper.getClassFactory()
      const constructorDeps = classFactory.getConstructorDependencies()
      const propertyDeps = classFactory.getPropertyDependencies()
      expect(propertyDeps.get('container')).toBeInstanceOf(ClassWrapper)
      expect(constructorDeps[0]).toBeInstanceOf(ClassWrapper)
      expect(constructorDeps[1]).toBeInstanceOf(ClassWrapper)
      expect(constructorDeps[2]).toBeDefined()
      expect(constructorDeps[3]).toBeInstanceOf(ClassWrapper)

      const instance: FooService = classFactory.getOrCreateInstance()
      expect(instance).toBeInstanceOf(FooService)
      expect(instance.container).toBeInstanceOf(Container)
    }
  }
  new Bootstrap().run()
})

it('should create constant', () => {
  class Bootstrap extends AbstractBootstrap {
    async run() {
      this.createConstantWrapper('foo', 'bar').save()
      expect(this.getContainer().get('foo')).toBeInstanceOf(ConstantWrapper)
      expect((this.getContainer().get('foo') as ConstantWrapper).getValue()).toBe('bar')
    }
  }
  new Bootstrap().run()
})

it('should use a plugin', () => {
  class Bootstrap extends AbstractBootstrap {
    async run() {
      this.use({
        name: 'naily:test-plugin',
        beforeRun(container) {
          container.createConstantWrapper('foo2', 'bar2').save()
          expect(container.getContainer().get('foo')).toBeInstanceOf(ConstantWrapper)
          expect((container.getContainer().get('foo') as ConstantWrapper).getValue()).toBe('bar')
        },
      })
    }
  }
  new Bootstrap().run()
})

it('should replace container', () => {
  class Bootstrap extends AbstractBootstrap {
    async run() {
      const map = new Map()
      this.replaceContainer(map)
      expect(this.getContainer()).toBe(map)
    }
  }
  new Bootstrap().run()
})
