import type { CallType, PostConstructMetadata } from '../types'
import type { PostConstructMetadataWrapper } from './post-construct-options-wrapper'
import { TaskRunner } from '../task-runner'
import { AbstractClassWrapperProvider } from './class-wrapper-provider'

export class SinglePostConstructMetadataWrapper extends AbstractClassWrapperProvider {
  constructor(
    private readonly postConstructMetadataWrapper: PostConstructMetadataWrapper,
    private readonly options: PostConstructMetadata,
  ) {
    super(
      postConstructMetadataWrapper.getGlobalContainer(),
      postConstructMetadataWrapper.getClassWrapper(),
    )
  }

  private _taskRunner: TaskRunner | undefined
  getTaskRunner(cache: boolean = true): TaskRunner {
    if (this._taskRunner && cache) return this._taskRunner
    this._taskRunner = new TaskRunner()
    return this._taskRunner
  }

  getCallType(): CallType {
    return this.options.callType
  }

  getPropertyKey(): string | symbol {
    return this.options.propertyKey
  }

  isParallel(): boolean {
    return (this.options.callType || 'parallel') === 'parallel'
  }

  isSeries(): boolean {
    return !this.isParallel() && (this.options.callType || 'parallel') === 'series'
  }
}
