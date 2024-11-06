import { Container, IocPlugin } from '@nailyjs/ioc'
import { SchedulerExecutor } from './scheduler-executor'
import { getSchedulersInstance } from './scheduler-getter'

class SchedulePluginImpl implements IocPlugin {
  name: string = 'naily:schedule-plugin'

  async beforeRun(container: Container): Promise<void> {
    const scheduler = getSchedulersInstance(container)
    await new SchedulerExecutor(container, scheduler).setup()
  }
}

export function SchedulePlugin(): IocPlugin {
  return new SchedulePluginImpl()
}
