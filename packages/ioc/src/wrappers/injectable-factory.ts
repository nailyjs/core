import type { SingleInjectOptionWrapper } from './single-inject-option-wrapper'
import { ClassWrapper } from './class-wrapper'
import { AbstractClassWrapperProvider } from './class-wrapper-provider'
import { ConstantWrapper } from './constant-wrapper'

export class InjectableFactory<Instance = any> extends AbstractClassWrapperProvider {
  constructor(injectableFactoryClassWrapper: ClassWrapper<Instance>) {
    super(injectableFactoryClassWrapper.getGlobalContainer(), injectableFactoryClassWrapper)
  }

  createRawInstance<Args extends any[]>(args: Args): Instance {
    return Reflect.construct(this.getClassWrapper().getTarget(), args)
  }

  getInjectedConstructorDependencies(existDeps: (ClassWrapper | ConstantWrapper | undefined)[] = []): (ClassWrapper | ConstantWrapper | undefined)[] {
    const dependencies: (ClassWrapper | ConstantWrapper | undefined)[] = []
    const markedInjected: SingleInjectOptionWrapper[] = this.getMetadataScanner()
      .getInjectMetadata()
      .getInjectOptions()
      .filter(injectOptions => injectOptions.isConstructorInjection())
      .filter(injectOptions => injectOptions.isRequired())

    for (const inject of markedInjected) {
      const parameterIndex = inject.getParameterIndex()
      if (typeof parameterIndex !== 'number') continue
      const injectionToken = inject.getInjectionToken()
      if (!injectionToken) continue
      const wrapper = this.getGlobalContainer().getContainer().get(injectionToken)
      if (!wrapper && inject.isRequired() && !existDeps[parameterIndex])
        throw new Error(`Dependency not found for injectionToken ${injectionToken.toString()}.`)
      dependencies[parameterIndex] = wrapper
    }

    return dependencies
  }

  getReflectConstructorDependencies(existDeps: (ClassWrapper | ConstantWrapper | undefined)[] = []): (ClassWrapper | ConstantWrapper | undefined)[] {
    const dependencies: (ClassWrapper | ConstantWrapper | undefined)[] = []
    const designParamTypes = this.getMetadataScanner().getConstructorParamTypes()
    const markedInjected: SingleInjectOptionWrapper[] = this.getMetadataScanner()
      .getInjectMetadata()
      .getInjectOptions()
      .filter(injectOptions => injectOptions.isConstructorInjection())

    for (let i = 0; i < designParamTypes.length; i++) {
      const designParamType = designParamTypes[i]
      if (designParamType === undefined) continue
      const wrapper = this.getGlobalContainer().getContainer().get(designParamType)
      const injectInfo = markedInjected.find(injectOptions => injectOptions.getParameterIndex() === i)
      if (!wrapper && (!injectInfo || injectInfo.isRequired()) && !existDeps[i])
        throw new Error(`Dependency not found for designParamType ${designParamType.toString()}.`)
      dependencies[i] = wrapper
    }

    return dependencies
  }

  getConstructorDependencies(): (ClassWrapper | ConstantWrapper | undefined)[] {
    const injectedDependencies = this.getInjectedConstructorDependencies()
    const reflectDependencies = this.getReflectConstructorDependencies(injectedDependencies)
    const dependencies: (ClassWrapper | ConstantWrapper | undefined)[] = []

    // 如果 injectedDependencies 有值，就用 injectedDependencies，否则用 reflectDependencies
    const length = Math.max(injectedDependencies.length, reflectDependencies.length)
    for (let i = 0; i < length; i++)
      dependencies[i] = injectedDependencies[i] || reflectDependencies[i]

    return dependencies
  }

  getPropertyDependencies(): Map<string | symbol, ClassWrapper | ConstantWrapper | undefined> {
    const dependencies = new Map<string | symbol, ClassWrapper | ConstantWrapper | undefined>()
    const markedInjected: SingleInjectOptionWrapper[] = this.getMetadataScanner()
      .getInjectMetadata()
      .getInjectOptions()
      .filter(injectOptions => injectOptions.isPropertyInjection())

    for (const inject of markedInjected) {
      const propertyKey = inject.getPropertyKey()
      if (!propertyKey) continue
      const propertyType = this.getMetadataScanner().getPropertyType(propertyKey)
      const injectionToken = inject.getInjectionToken()
      if (injectionToken) {
        const wrapper = this.getGlobalContainer().getContainer().get(injectionToken)
        if (!wrapper && inject.isRequired()) throw new Error(`Dependency not found for injectionToken ${injectionToken.toString()}.`)
        dependencies.set(propertyKey, wrapper)
      }
      else if (propertyType) {
        const wrapper = this.getGlobalContainer().getContainer().get(propertyType)
        if (!wrapper && inject.isRequired()) throw new Error(`Dependency not found for propertyType ${propertyType.toString()}.`)
        dependencies.set(propertyKey, wrapper)
      }
      else {
        throw new Error(`Property type not found for propertyKey ${propertyKey.toString()} in class ${this.getClassWrapper().getTarget().name}.`)
      }
    }

    return dependencies
  }

  private createInstanceByWrapper(wrapper: ClassWrapper | ConstantWrapper | undefined): any | undefined {
    if (!wrapper) return undefined
    if (wrapper instanceof ClassWrapper) return wrapper.getClassFactory().getOrCreateInstance()
    else if (wrapper instanceof ConstantWrapper) return wrapper.getValue()
    else return undefined
  }

  getOrCreateInstance<Ins = Instance>(): Ins {
    const classWrapper = this.getClassWrapper()
    const metadataScanner = classWrapper.getMetadataScanner()
    const injectableMetadata = metadataScanner.getInjectableMetadata()
    const constructorDeps = this.getConstructorDependencies()
    const propertyDeps = this.getPropertyDependencies()

    const currentSingletonInstance = classWrapper.getSingletonInstance()
    if (currentSingletonInstance && injectableMetadata.isSingleton()) return currentSingletonInstance

    const args = constructorDeps.map(this.createInstanceByWrapper.bind(this))
    const instance = this.createRawInstance(args)

    for (const [key, wrapper] of propertyDeps)
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      instance[key] = this.createInstanceByWrapper(wrapper)

    classWrapper.setSingletonInstance(instance)
    return instance as unknown as Ins
  }
}
