import { CronJob, CronJobParams } from 'cron'
import 'reflect-metadata'

export type CronTime = CronJobParams['cronTime']
export const CronWatermark = '__naily_schedule_cron__'

CronJob.from({
  cronTime: '',
  onTick: () => {},
})

export interface BaseCronOptions {
  unrefTimeout?: boolean
  scheduleName?: string
}

export type TimeZoneOptions = {
  timeZone?: string | null
  utcOffset?: never
} & {
  timeZone?: never
  utcOffset?: number | null
}

export type CronOptions = BaseCronOptions & TimeZoneOptions

export interface CronMetadata {
  cronTime: CronTime
  propertyKey: string
  options: CronOptions
}

export function Cron<Time extends CronTime>(cronTime: Time, options: CronOptions = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(CronWatermark, [
      ...(Reflect.getMetadata(CronWatermark, target.constructor === Function ? target : target.constructor) || []),
      {
        cronTime,
        propertyKey,
        options,
      },
    ] as CronMetadata[], target.constructor === Function ? target : target.constructor)
  }) as MethodDecorator
}
