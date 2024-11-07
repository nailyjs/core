import path from 'node:path'
import { cwd, exit } from 'node:process'
import { Value } from '@nailyjs/config'
import { ClassWrapper, Container, Service, Setupable } from '@nailyjs/ioc'
import { DevelopmentRunnerService } from './development-runner.service'
import { EntryAnalyzerService } from './entry-analyzer.service'
import { TsupService } from './tsup.service'
import { WatcherService } from './watcher.service'
import { LogoWriter } from './write-logo'

@Service()
export class DevelopmentStarter implements Setupable {
  constructor(
    private readonly tsupService: TsupService,
    private readonly entryAnalyzerService: EntryAnalyzerService,
    private readonly logoWriter: LogoWriter,
    private readonly developmentRunnerService: DevelopmentRunnerService,
    private readonly watcherService: WatcherService,
    @Value('naily.cli.development.using')
    private readonly _using: 'tsup' | 'vite',
  ) {}

  private refreshScreen(): void {
    console.clear()
    this.logoWriter.write()
  }

  private killer: () => boolean = () => true
  private async run(): Promise<void> {
    await this.tsupService.setup('dev')
    this.refreshScreen()
    const outDir = this.tsupService.getOutDir('dev')
    // it is a entry point of the application, so must convert it to output
    const runnerEntry = this.tsupService.getRunnerEntry('dev')
    const runnerEntryOutput = this.entryAnalyzerService.analyzeRunnerEntryToGetOutput(runnerEntry, outDir)
    this.killer = this.developmentRunnerService.createProcess(runnerEntryOutput)
  }

  async setup(): Promise<void> {
    if (typeof this._using === 'string' && this._using !== 'tsup') {
      console.error('Only tsup is supported as a development tool for now.')
      return exit(0)
    }

    await this.run()
    this.watcherService.getWatcher().on('all', async (ev, changedPath) => {
      console.log(`File ${path.relative(cwd(), changedPath)} has been ${ev}`)
      this.killer()
      this.refreshScreen()
      await this.run()
    })
  }

  static getInstance(container: Container): DevelopmentStarter {
    const wrapper = container.getContainer().get(DevelopmentStarter) as ClassWrapper<DevelopmentStarter>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(DevelopmentStarter).getClassFactory().getOrCreateInstance()
  }
}
