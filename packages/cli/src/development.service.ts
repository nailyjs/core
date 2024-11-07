import child_process from 'node:child_process'
import { exit } from 'node:process'
import { Value } from '@nailyjs/config'
import { ClassWrapper, Container, Service, Setupable } from '@nailyjs/ioc'
import { EntryAnalyzerService } from './entry-analyzer.service'
import { TsupService } from './tsup.service'
import { LogoWriter } from './write-logo'

@Service()
export class DevelopmentStarter implements Setupable {
  constructor(
    private readonly tsupService: TsupService,
    private readonly entryAnalyzerService: EntryAnalyzerService,
    private readonly logoWriter: LogoWriter,
  ) {}

  @Value('naily.cli.development.using')
  private readonly _using: 'tsup' | 'vite'

  async setup(): Promise<void> {
    if (typeof this._using === 'string' && this._using !== 'tsup') {
      console.error('Only tsup is supported as a development tool for now.')
      return exit(0)
    }

    await this.tsupService.setup()
    const outDir = this.tsupService.getOutDir()
    // it is a entry point of the application, so must convert it to output
    const runnerEntry = this.tsupService.getRunnerEntry()
    const runnerEntryOutput = this.entryAnalyzerService.analyzeRunnerEntryToGetOutput(runnerEntry, outDir)
    console.clear()
    this.logoWriter.write()
    child_process.spawn('node', [runnerEntryOutput], { stdio: 'inherit' })
  }

  static getInstance(container: Container): DevelopmentStarter {
    const wrapper = container.getContainer().get(DevelopmentStarter) as ClassWrapper<DevelopmentStarter>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(DevelopmentStarter).getClassFactory().getOrCreateInstance()
  }
}
