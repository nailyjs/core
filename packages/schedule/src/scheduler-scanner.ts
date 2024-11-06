import { ClassWrapper } from '@nailyjs/ioc'
import { CronMetadata, CronWatermark, IntervalMetadata, TimeoutMetadata, TimeoutWatermark } from './decorators'
import { IntervalMetadataWrapper } from './wrappers'
import { CronMetadataWrapper } from './wrappers/cron-metadata-wrapper'
import { TimeoutMetadataWrapper } from './wrappers/timeout-metadata-wrapper'

export class SchedulerScanner {
  constructor(private readonly wrapper: ClassWrapper) {}

  getClassWrapper(): ClassWrapper {
    return this.wrapper
  }

  hasCronTasks(): boolean {
    const cron = this.getCronTasks()
    return cron.length > 0
  }

  getCronTasks(): CronMetadataWrapper[] {
    const tasks: CronMetadata[] = this.wrapper.getMetadata(CronWatermark) || []
    return tasks.map(task => new CronMetadataWrapper(this, task))
  }

  getTimeoutTasks(): TimeoutMetadataWrapper[] {
    const tasks: TimeoutMetadata[] = this.wrapper.getMetadata(TimeoutWatermark) || []
    return tasks.map(task => new TimeoutMetadataWrapper(this, task))
  }

  hasTimeoutTasks(): boolean {
    const timeout = this.getTimeoutTasks()
    return timeout.length > 0
  }

  getIntervalTasks(): IntervalMetadataWrapper[] {
    const tasks: IntervalMetadata[] = this.wrapper.getMetadata(TimeoutWatermark) || []
    return tasks.map(task => new IntervalMetadataWrapper(this, task))
  }

  hasIntervalTasks(): boolean {
    const interval = this.getIntervalTasks()
    return interval.length > 0
  }
}
