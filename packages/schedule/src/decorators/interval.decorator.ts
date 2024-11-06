export const IntervalWatermark = '__naily_schedule_interval__'

export interface IntervalMetadata {
  interval: number
  propertyKey: string
}

export function Interval<Interval extends number>(interval: Interval): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(IntervalWatermark, [
      ...(Reflect.getMetadata(IntervalWatermark, target.constructor === Function ? target : target.constructor) || []),
      {
        interval,
        propertyKey,
      },
    ] as IntervalMetadata[], target.constructor === Function ? target : target.constructor)
  }) as MethodDecorator
}
