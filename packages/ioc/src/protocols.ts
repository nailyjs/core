import type { Container } from './container'
import type { MetadataScanner } from './metadata-scanner'
import type { InjectionToken } from './types'
import type { ClassWrapper } from './wrappers/class-wrapper'

export interface Saveable {
  save(...args: any[]): void | this
}
export interface GetInjectionTokenable {
  getInjectionToken(): InjectionToken | undefined
}
export interface GetGlobalContainerable {
  getGlobalContainer(): Container
}
export interface GetClassWrapperable {
  getClassWrapper(): ClassWrapper
}
export interface GetMetadataScannerable {
  getMetadataScanner(): MetadataScanner
}
export interface ContainerWrapper extends Saveable, GetInjectionTokenable, GetGlobalContainerable {
  wrapperType: 'class' | 'constant'
}
export interface ClassWrapperProvider extends GetClassWrapperable, GetMetadataScannerable, GetGlobalContainerable {}
export interface IocPlugin {
  name: string
  beforeRun?(container: Container): unknown | Promise<unknown>
}
