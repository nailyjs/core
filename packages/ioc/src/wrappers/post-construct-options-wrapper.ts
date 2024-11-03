import type { MetadataScanner } from '../metadata-scanner'
import type { TaskRunner } from '../task-runner'
import type { PostConstructMetadata } from '../types'
import { PostConstructWatermark } from '../constant'
import { AbstractClassWrapperProvider } from './class-wrapper-provider'
import { SinglePostConstructMetadataWrapper } from './single-post-construct-options-wrapper'

export class PostConstructMetadataWrapper extends AbstractClassWrapperProvider {
  constructor(metadataScanner: MetadataScanner) {
    super(
      metadataScanner.getClassWrapper().getGlobalContainer(),
      metadataScanner.getClassWrapper(),
    )
  }

  getTaskRunner(): TaskRunner {
    return this.getGlobalContainer().getTaskRunner()
  }

  getRawPostConstructOptions(): PostConstructMetadata[] {
    return this.getClassWrapper().getMetadata(PostConstructWatermark) || []
  }

  getPostConstructOptions(): SinglePostConstructMetadataWrapper[] {
    return this.getRawPostConstructOptions().map(options => (
      new SinglePostConstructMetadataWrapper(this, options)
    ))
  }
}
