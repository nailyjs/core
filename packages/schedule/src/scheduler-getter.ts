import { Container } from '@nailyjs/ioc'
import { SchedulerRegistry } from './scheduler.registry'

export function getSchedulersInstance(container?: Container): SchedulerRegistry {
  container = container || new Container()
  const wrapper = container.getContainer().get(SchedulerRegistry)
  if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
  return container.createClassWrapper(SchedulerRegistry).getClassFactory().getOrCreateInstance()
}
