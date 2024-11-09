import path from 'node:path'
import { Value } from '@nailyjs/config'
import { Service } from '@nailyjs/ioc'
import defu from 'defu'
import * as tsup from 'tsup'
import { DevelopmentRunnerService } from '../development-runner.service'
import { EntryAnalyzerService } from '../entry-analyzer.service'
import { PackageFileService } from '../package-file.service'
import { LogoWriter } from '../write-logo'
import { Compiler } from './compiler.protocol'

@Service()
export class TsupService implements Compiler {
  constructor(
    private readonly entryAnalyzerService: EntryAnalyzerService,
    private readonly packageFileService: PackageFileService,
    private readonly developmentRunnerService: DevelopmentRunnerService,
    private readonly logoWriter: LogoWriter,

    @Value('naily.cli.development.tsup')
    private readonly _devTsup: tsup.Options,

    @Value('naily.cli.build.tsup')
    private readonly _buildTsup: tsup.Options,

    @Value('naily.cli.development.runnerEntry')
    private readonly _runnerEntry: string,
  ) {}

  private getDefaultFormat(): tsup.Options['format'] {
    const packageType = this.packageFileService.getType()

    if (!packageType) return ['cjs', 'esm']
    else if (packageType === 'module') return 'esm'
    else return 'cjs'
  }

  private getDefaultConfiguration(): tsup.Options {
    return {
      entry: this.entryAnalyzerService.getEntry(),
      format: this.getDefaultFormat(),
      dts: false,
      sourcemap: true,
      minify: false,
      clean: true,
      publicDir: true,
    }
  }

  private getMergedConfiguration(mode: 'build' | 'dev'): tsup.Options {
    return defu(mode === 'dev' ? this._devTsup : this._buildTsup, this.getDefaultConfiguration())
  }

  private getOutDir(mode: 'build' | 'dev' = 'dev'): string {
    return path.resolve(this.getMergedConfiguration(mode).outDir || 'dist')
  }

  getRunnerEntry(mode: 'build' | 'dev'): string {
    if (this._runnerEntry) return path.resolve(this._runnerEntry)
    const mergedConfiguration = this.getMergedConfiguration(mode)
    if (Array.isArray(mergedConfiguration.entry)) return path.resolve(mergedConfiguration.entry[0] || '')
    else return path.resolve(Object.values(mergedConfiguration.entry)[0] || '')
  }

  async setup(mode: 'build' | 'dev'): Promise<void> {
    return await tsup.build(this.getMergedConfiguration(mode))
  }

  private refreshScreen(): void {
    console.clear()
    this.logoWriter.write()
  }

  private tsupProcessKiller: () => boolean = () => true
  async runDevelopmentMode(): Promise<void> {
    await this.setup('dev')
    this.refreshScreen()
    const outDir = this.getOutDir('dev')
    // it is a entry point of the application, so must convert it to output
    const runnerEntry = this.getRunnerEntry('dev')
    const runnerEntryOutput = this.entryAnalyzerService.analyzeRunnerEntryToGetOutput(runnerEntry, outDir)
    this.tsupProcessKiller = this.developmentRunnerService.createProcess(runnerEntryOutput)
  }

  async onWatch(): Promise<void> {
    this.tsupProcessKiller()
    this.refreshScreen()
    await this.runDevelopmentMode()
  }
}
