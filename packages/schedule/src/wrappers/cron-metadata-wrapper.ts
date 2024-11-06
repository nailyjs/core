import { CronMetadata, CronOptions, CronTime } from '../decorators'
import { SchedulerScanner } from '../scheduler-scanner'

export class CronMetadataWrapper {
  constructor(
    private readonly schedulerScanner: SchedulerScanner,
    private readonly metadata: CronMetadata,
  ) {}

  getSchedulerScanner(): SchedulerScanner {
    return this.schedulerScanner
  }

  getCronTime(): CronTime {
    return this.metadata.cronTime
  }

  getPropertyKey(): string {
    return this.metadata.propertyKey
  }

  getExtraOptions(): CronOptions {
    return this.metadata.options
  }
}
