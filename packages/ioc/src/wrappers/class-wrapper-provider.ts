import type { Container } from '../container'
import type { MetadataScanner } from '../metadata-scanner'
import type { ClassWrapperProvider } from '../protocols'
import type { ClassWrapper } from './class-wrapper'

export abstract class AbstractClassWrapperProvider implements ClassWrapperProvider {
  constructor(
    private readonly container: Container,
    private readonly classWrapper: ClassWrapper,
  ) {}

  getGlobalContainer(): Container {
    return this.container
  }

  getClassWrapper(): ClassWrapper {
    return this.classWrapper
  }

  getMetadataScanner(): MetadataScanner {
    return this.classWrapper.getMetadataScanner()
  }
}
