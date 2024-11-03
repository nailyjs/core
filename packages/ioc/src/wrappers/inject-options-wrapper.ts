import type { MetadataScanner } from '../metadata-scanner'
import type { InjectOptions } from '../types'
import { InjectWatermark } from '../constant'
import { AbstractClassWrapperProvider } from './class-wrapper-provider'
import { SingleInjectOptionWrapper } from './single-inject-option-wrapper'

export class InjectMetadataWrapper extends AbstractClassWrapperProvider {
  constructor(metadataScanner: MetadataScanner) {
    super(
      metadataScanner.getClassWrapper().getGlobalContainer(),
      metadataScanner.getClassWrapper(),
    )
  }

  getRawInjectOptions(): InjectOptions[] {
    return this.getClassWrapper().getMetadata(InjectWatermark) || []
  }

  getInjectOptions(): SingleInjectOptionWrapper[] {
    return this.getRawInjectOptions()
      .map(injectOptions => new SingleInjectOptionWrapper(this, injectOptions))
  }
}
