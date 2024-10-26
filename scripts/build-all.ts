import { execSync } from 'node:child_process'
import { scripts } from '../package.json'

for (const [name, _script] of Object.entries(scripts)) {
  if (!name.startsWith('build:')) continue

  execSync(`pnpm run ${name}`, {
    stdio: 'inherit',
  })
}
