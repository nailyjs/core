import type { Container } from '../container'
import type { MetadataScanner } from '../metadata-scanner'
import type { ClassWrapperProvider } from '../protocols'
import type { ClassWrapper } from './class-wrapper'
import type { ConstantWrapper } from './constant-wrapper'
import type { SingleInjectOptionWrapper } from './single-inject-option-wrapper'

export class InjectableFactory<Instance = any> implements ClassWrapperProvider {
  constructor(private readonly classWrapper: ClassWrapper<Instance>) {}

  getClassWrapper(): ClassWrapper<Instance> {
    return this.classWrapper
  }

  getGlobalContainer(cache: boolean = true): Container {
    return this.classWrapper.getGlobalContainer(cache)
  }

  getMetadataScanner(cache: boolean = true): MetadataScanner {
    return this.classWrapper.getMetadataScanner(cache)
  }

  createRawInstance<Args extends any[]>(args: Args): Instance {
    return Reflect.construct(this.classWrapper.getTarget(), args)
  }

  getInjectedConstructorDependencies(): (ClassWrapper | ConstantWrapper | undefined)[] {
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
      if (!wrapper && inject.isRequired()) throw new Error(`Dependency not found for injectionToken ${injectionToken.toString()}.`)
      dependencies[parameterIndex] = wrapper
    }

    return dependencies
  }

  getReflectConstructorDependencies(): (ClassWrapper | ConstantWrapper)[] {
    const dependencies: (ClassWrapper | ConstantWrapper)[] = []
    const designParamTypes = this.getMetadataScanner().getConstructorParamTypes()

    for (let i = 0; i < designParamTypes.length; i++) {
      const designParamType = designParamTypes[i]
      if (designParamType === undefined) continue
      const wrapper = this.getGlobalContainer().getContainer().get(designParamType)
      if (!wrapper) continue
      dependencies[i] = wrapper
    }

    return dependencies
  }

  getConstructorDependencies(): (ClassWrapper | ConstantWrapper | undefined)[] {
    const injectedDependencies = this.getInjectedConstructorDependencies()
    const reflectDependencies = this.getReflectConstructorDependencies()
    const dependencies: (ClassWrapper | ConstantWrapper)[] = []

    // 如果 injectedDependencies 有值，就用 injectedDependencies，否则用 reflectDependencies
    for (let i = 0; i < reflectDependencies.length; i++)
      dependencies[i] = injectedDependencies[i] || reflectDependencies[i]

    return dependencies
  }
}
