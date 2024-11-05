import fs from 'node:fs'
import path from 'node:path'
import { Value } from '@nailyjs/config'
import { ClassWrapper, Container, Injectable } from '@nailyjs/ioc'

let __dirname = globalThis.__dirname
if (!globalThis.__dirname)
  __dirname = import.meta.dirname

@Injectable()
export class LogoWriter {
  constructor(
    @Value('naily.cli.banner')
    private readonly logoPath: `${string}.txt` | false,
  ) {}

  write(clear: boolean = true): void {
    if (clear === true) console.clear()
    if (this.logoPath === false) return

    if (typeof this.logoPath === 'string') {
      const logoPath = path.resolve(this.logoPath)
      if (fs.existsSync(logoPath)) return console.log(fs.readFileSync(logoPath, 'utf-8'))
    }

    const defaultLogoPath = path.join(__dirname, '../logo.txt')
    if (fs.existsSync(defaultLogoPath)) console.log(fs.readFileSync(defaultLogoPath, 'utf-8'))
    else console.log('Naily CLI')
  }

  static getInstance(container: Container): LogoWriter {
    const writerWrapper = container.getContainer().get(LogoWriter) as ClassWrapper<LogoWriter>
    if (writerWrapper) return writerWrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(LogoWriter).getClassFactory().getOrCreateInstance()
  }
}
