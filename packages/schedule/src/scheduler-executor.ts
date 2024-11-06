import { ClassWrapper, Container, Injectable } from '@nailyjs/ioc'
import { CronJob } from 'cron'
import { SchedulerRegistry } from './scheduler.registry'
import { SchedulerScanner } from './scheduler-scanner'

@Injectable()
export class SchedulerExecutor {
  constructor(
    private readonly container: Container,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private static randomId(wrapper: ClassWrapper, propertyKey: string | symbol): string {
    const name = wrapper.getTarget().name

    return `${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}-${name}-${propertyKey.toString()}`
  }

  private async setupCrons(schedulerScanner: SchedulerScanner): Promise<void> {
    const metadata = schedulerScanner.getCronTasks()
    const wrapper = schedulerScanner.getClassWrapper()
    const instance = wrapper.getClassFactory().getOrCreateInstance()

    for (const cron of metadata) {
      const cronTime = cron.getCronTime()
      const propertyKey = cron.getPropertyKey()

      if (!cronTime || typeof instance[propertyKey] !== 'function') continue
      const method = instance[propertyKey].bind(instance)
      const job = CronJob.from({
        cronTime,
        onTick: method,
        ...(cron.getExtraOptions() || {}),
      })
      job.start()
      this.schedulerRegistry.setCronJob(SchedulerExecutor.randomId(wrapper, propertyKey), job)
    }
  }

  private async setupTimeouts(schedulerScanner: SchedulerScanner): Promise<void> {
    const metadata = schedulerScanner.getTimeoutTasks()
    const wrapper = schedulerScanner.getClassWrapper()
    const instance = wrapper.getClassFactory().getOrCreateInstance()

    for (const timeout of metadata) {
      const timeoutValue = timeout.getTimeout()
      const propertyKey = timeout.getPropertyKey()

      if (!timeoutValue || typeof instance[propertyKey] !== 'function') continue
      const method = instance[propertyKey].bind(instance)
      const timeoutId = setTimeout(method, timeoutValue)
      this.schedulerRegistry.setTimeout(SchedulerExecutor.randomId(wrapper, propertyKey), timeoutId)
    }
  }

  private async setupIntervals(schedulerScanner: SchedulerScanner): Promise<void> {
    const metadata = schedulerScanner.getIntervalTasks()
    const wrapper = schedulerScanner.getClassWrapper()
    const instance = wrapper.getClassFactory().getOrCreateInstance()

    for (const interval of metadata) {
      const intervalValue = interval.getInterval()
      const propertyKey = interval.getPropertyKey()

      if (!intervalValue || typeof instance[propertyKey] !== 'function') continue
      const method = instance[propertyKey].bind(instance)
      const intervalId = setInterval(method, intervalValue)
      this.schedulerRegistry.setInterval(SchedulerExecutor.randomId(wrapper, propertyKey), intervalId)
    }
  }

  public async setup(): Promise<void> {
    const map = this.container.getContainer()

    for (const [_injectionToken, wrapper] of map) {
      if (wrapper.wrapperType !== 'class') continue
      const schedulerScanner = new SchedulerScanner(wrapper)

      await Promise.all([
        this.setupCrons(schedulerScanner),
        this.setupTimeouts(schedulerScanner),
        this.setupIntervals(schedulerScanner),
      ])
    }
  }
}
