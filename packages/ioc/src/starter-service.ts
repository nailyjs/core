import { Container } from './container'
import { Class } from './types'
import { ClassWrapper } from './wrappers'

export abstract class StartService {
  static getInstance(container: Container): any {
    const wrapper = container.getContainer().get(this as any as Class) as ClassWrapper<any>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(this as any as Class).save().getClassFactory().getOrCreateInstance()
  }
}
