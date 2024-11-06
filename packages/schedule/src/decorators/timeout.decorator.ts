export const TimeoutWatermark = '__naily_schedule_timeout__'

export interface TimeoutMetadata {
  timeout: number
  propertyKey: string
}

export function Timeout<Timeout extends number>(timeout: Timeout): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(TimeoutWatermark, [
      ...(Reflect.getMetadata(TimeoutWatermark, target.constructor === Function ? target : target.constructor) || []),
      {
        timeout,
        propertyKey,
      },
    ] as TimeoutMetadata[], target.constructor === Function ? target : target.constructor)
  }) as MethodDecorator
}
