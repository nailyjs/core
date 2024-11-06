import { TimeoutMetadata } from '../decorators'
import { SchedulerScanner } from '../scheduler-scanner'

export class TimeoutMetadataWrapper {
  constructor(
    private readonly schedulerScanner: SchedulerScanner,
    private readonly metadata: TimeoutMetadata,
  ) {}

  getSchedulerScanner(): SchedulerScanner {
    return this.schedulerScanner
  }

  getTimeout(): number {
    return this.metadata.timeout
  }

  getPropertyKey(): string | symbol {
    return this.metadata.propertyKey
  }
}
