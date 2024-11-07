import path from 'node:path'
import { Value } from '@nailyjs/config'
import { Service, Setupable } from '@nailyjs/ioc'
import defu from 'defu'
import * as tsup from 'tsup'
import { EntryAnalyzerService } from './entry-analyzer.service'
import { PackageFileService } from './package-file.service'

@Service()
export class TsupService implements Setupable {
  constructor(
    private readonly entryAnalyzerService: EntryAnalyzerService,
    private readonly packageFileService: PackageFileService,
  ) {}

  @Value('naily.cli.development.tsup')
  private readonly _tsup: tsup.Options

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

  getMergedConfiguration(): tsup.Options {
    return defu(this._tsup, this.getDefaultConfiguration())
  }

  getOutDir(): string {
    return path.resolve(this.getMergedConfiguration().outDir || 'dist')
  }

  @Value('naily.cli.development.runnerEntry')
  private readonly _runnerEntry: string

  getRunnerEntry(): string {
    if (this._runnerEntry) return path.resolve(this._runnerEntry)
    const mergedConfiguration = this.getMergedConfiguration()
    if (Array.isArray(mergedConfiguration.entry)) return path.resolve(mergedConfiguration.entry[0] || '')
    else return path.resolve(Object.values(mergedConfiguration.entry)[0] || '')
  }

  async setup(): Promise<void> {
    return await tsup.build(this.getMergedConfiguration())
  }
}
