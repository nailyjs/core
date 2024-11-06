import type { SchedulerScanner } from '../scheduler-scanner'
import { IntervalMetadata } from '../decorators'

export class IntervalMetadataWrapper {
  constructor(
    private readonly schedulerScanner: SchedulerScanner,
    private readonly metadata: IntervalMetadata,
  ) {}

  getSchedulerScanner(): SchedulerScanner {
    return this.schedulerScanner
  }

  getInterval(): number {
    return this.metadata.interval
  }

  getPropertyKey(): string | symbol {
    return this.metadata.propertyKey
  }
}
