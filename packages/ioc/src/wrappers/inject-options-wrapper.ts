import type { Container } from '../container'
import type { MetadataScanner } from '../metadata-scanner'
import type { ClassWrapperProvider } from '../protocols'
import type { InjectOptions } from '../types'
import type { ClassWrapper } from './class-wrapper'
import { InjectWatermark } from '../constant'
import { SingleInjectOptionWrapper } from './single-inject-option-wrapper'

export class InjectMetadataWrapper implements ClassWrapperProvider {
  constructor(private readonly metadataScanner: MetadataScanner) {}

  getMetadataScanner(): MetadataScanner {
    return this.metadataScanner
  }

  getClassWrapper(): ClassWrapper {
    return this.getMetadataScanner().getClassWrapper()
  }

  getGlobalContainer(cache: boolean = true): Container {
    return this.getClassWrapper().getGlobalContainer(cache)
  }

  getRawInjectOptions(): InjectOptions[] {
    return this.getClassWrapper().getMetadata(InjectWatermark) || []
  }

  getInjectOptions(): SingleInjectOptionWrapper[] {
    return this.getRawInjectOptions()
      .map(injectOptions => new SingleInjectOptionWrapper(this, injectOptions))
  }
}
