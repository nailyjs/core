import type * as tsup from 'tsup'
import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { Service } from '@nailyjs/ioc'
import { PackageFileService } from './package-file.service'

@Service()
export class EntryAnalyzerService {
  constructor(private readonly packageFileService: PackageFileService) {}

  private readonly entry: string[] = []

  private addFileIfExist(filePath: string): boolean {
    if (fs.existsSync(filePath)) {
      this.entry.push(filePath)
      return true
    }
    else return false
  }

  getEntry(): tsup.Options['entry'] {
    const mainFilePath = this.packageFileService.getMain()
    if (mainFilePath) {
      const isAdded = this.addFileIfExist(path.join(cwd(), mainFilePath))
      if (isAdded) return this.entry
    }

    const processDir = cwd()
    this.addFileIfExist(path.join(processDir, './src/index.ts'))
    this.addFileIfExist(path.join(processDir, './src/index.tsx'))
    this.addFileIfExist(path.join(processDir, './src/index.js'))
    this.addFileIfExist(path.join(processDir, './src/index.jsx'))

    this.addFileIfExist(path.join(processDir, './src/main.ts'))
    this.addFileIfExist(path.join(processDir, './src/main.tsx'))
    this.addFileIfExist(path.join(processDir, './src/main.js'))
    this.addFileIfExist(path.join(processDir, './src/main.jsx'))

    this.addFileIfExist(path.join(processDir, './index.ts'))
    this.addFileIfExist(path.join(processDir, './index.tsx'))
    this.addFileIfExist(path.join(processDir, './index.js'))
    this.addFileIfExist(path.join(processDir, './index.jsx'))

    this.addFileIfExist(path.join(processDir, './main.ts'))
    this.addFileIfExist(path.join(processDir, './main.tsx'))
    this.addFileIfExist(path.join(processDir, './main.js'))
    this.addFileIfExist(path.join(processDir, './main.jsx'))

    return this.entry
  }

  analyzeRunnerEntryToGetOutput(entry: string, outDir: string): string {
    if (path.isAbsolute(entry)) entry = path.relative(cwd(), entry)
    const parsedPath = path.parse(entry)
    const outputJs = path.join(outDir, `${parsedPath.name}.js`)
    const outputMjs = path.join(outDir, `${parsedPath.name}.mjs`)
    const outputCjs = path.join(outDir, `${parsedPath.name}.cjs`)

    const output = [outputJs, outputMjs, outputCjs].find(filePath => fs.existsSync(filePath))
    if (output) return output
    else throw new Error(`Cannot auto find output file for ${entry}, please specify in naily config file in 'naily.cli.development.runnerEntry'.`)
  }
}
