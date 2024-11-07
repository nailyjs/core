import { Service, Setupable } from '@nailyjs/ioc'
import { TsupService } from './tsup.service'

@Service()
export class ProductionStarter implements Setupable {
  constructor(private readonly tsupService: TsupService) {}

  async setup(): Promise<void> {
    return this.tsupService.setup()
  }
}
