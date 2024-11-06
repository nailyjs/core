import { Injectable } from '@nailyjs/ioc'
import { CronJob } from 'cron'

@Injectable()
export class SchedulerRegistry {
  private readonly cronJobs = new Map<string, CronJob>()
  private readonly timeouts = new Map<string, NodeJS.Timeout | string | number | undefined>()
  private readonly intervals = new Map<string, NodeJS.Timeout | string | number | undefined>()

  setCronJob(name: string, cronJob: CronJob): void {
    if (this.cronJobs.has(name)) this.deleteCronJob(name)
    this.cronJobs.set(name, cronJob)
  }

  getCronJob(name: string): CronJob | undefined {
    return this.cronJobs.get(name)
  }

  deleteCronJob(name: string): void {
    const cronJob = this.cronJobs.get(name)
    if (cronJob) cronJob.stop()
    this.cronJobs.delete(name)
  }

  setTimeout(name: string, timeout: NodeJS.Timeout | string | number | undefined): void {
    if (this.timeouts.has(name)) this.deleteTimeout(name)
    this.timeouts.set(name, timeout)
  }

  getTimeout(name: string): NodeJS.Timeout | string | number | undefined {
    return this.timeouts.get(name)
  }

  deleteTimeout(name: string): void {
    const timeout = this.timeouts.get(name)
    if (timeout) clearTimeout(timeout as NodeJS.Timeout)
    this.timeouts.delete(name)
  }

  setInterval(name: string, interval: NodeJS.Timeout | string | number | undefined): void {
    if (this.intervals.has(name)) this.deleteInterval(name)
    this.intervals.set(name, interval)
  }

  getInterval(name: string): NodeJS.Timeout | string | number | undefined {
    return this.intervals.get(name)
  }

  deleteInterval(name: string): void {
    const interval = this.intervals.get(name)
    if (interval) clearInterval(interval as NodeJS.Timeout)
    this.intervals.delete(name)
  }
}
