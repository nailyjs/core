import { ClassWrapper, Container, Service, Setupable } from '@nailyjs/ioc'
import { TsupService } from './tsup.service'
import { LogoWriter } from './write-logo'

@Service()
export class ProductionStarter implements Setupable {
  constructor(
    private readonly tsupService: TsupService,
    private readonly logoWriter: LogoWriter,
  ) {}

  private refreshScreen(): void {
    console.clear()
    this.logoWriter.write()
  }

  async setup(): Promise<void> {
    this.refreshScreen()
    return this.tsupService.setup()
  }

  static getInstance(container: Container): ProductionStarter {
    const wrapper = container.getContainer().get(ProductionStarter) as ClassWrapper<ProductionStarter>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(ProductionStarter).getClassFactory().getOrCreateInstance()
  }
}
