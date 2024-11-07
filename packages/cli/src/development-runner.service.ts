import child_process from 'node:child_process'
import path from 'node:path'
import { stderr, stdout } from 'node:process'
import { Service } from '@nailyjs/ioc'

@Service()
export class DevelopmentRunnerService {
  createProcess(filePath: string): () => void {
    const resolvedFilePath = path.resolve(filePath)
    const forked = child_process.spawn('node', [resolvedFilePath])

    const dout = forked.stdout?.pipe(stdout)
    const derr = forked.stderr?.pipe(stderr)

    function killer(signal: NodeJS.Signals | number = 0): void {
      dout?.unpipe(stdout)
      derr?.unpipe(stderr)
      forked.kill(signal)
    }

    return killer
  }
}
