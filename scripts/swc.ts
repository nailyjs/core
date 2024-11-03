import { Buffer } from 'node:buffer'
import child_process from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { transform } from '@swc/core'

const modulePath = process.argv[2]
const timeoutToDelete = process.argv[3]
if (!modulePath) throw new Error('Path not provided')
if (!fs.existsSync(modulePath)) throw new Error('Path does not exist')

const result = await transform(fs.readFileSync(modulePath).toString('utf-8'), {
  minify: !process.argv.includes('--exit-delete'),
  sourceMaps: 'inline',
  jsc: {
    transform: {
      decoratorMetadata: true,
      legacyDecorator: true,
    },
    target: 'es2015',
    loose: true,
    keepClassNames: true,
    parser: {
      syntax: 'typescript',
      decorators: true,
      tsx: true,
    },
  },
})

const filePath = path.join(path.dirname(modulePath), `swc-cache-${path.basename(modulePath)}-${new Date().getTime()}-${Math.random() * 10}.js`)

// sourceMapBase64 is the last line of the code
const lastLine = result.code.split('\n').pop()
const sourceMapBase64 = lastLine.startsWith('//# sourceMappingURL=data:application/json;base64,') ? lastLine.split('sourceMappingURL=data:application/json;base64,')[1] : ''
const newSourceMap = Buffer.from(sourceMapBase64, 'base64')
  .toString('utf-8')
  // replace <anon> with the module name. This is important for debugging
  .replace(/<anon>/g, path.basename(modulePath))
const newBase64Sourcemap = Buffer.from(newSourceMap).toString('base64')
const newCode = result.code.replace(/[^\n]*$/, `//# sourceMappingURL=data:application/json;base64,${newBase64Sourcemap}`)
fs.writeFileSync(filePath, newCode)

const childProcess = child_process.exec(`FORCE_COLOR=1 tsx ${filePath}`)
childProcess.stdout.pipe(process.stdout)
childProcess.stderr.pipe(process.stderr)

if (!process.argv.includes('--exit-delete')) {
  setTimeout(() => {
    try {
      fs.unlinkSync(filePath)
    }
    catch {}
  }, Number.parseInt(timeoutToDelete) || 500)
}
else {
  childProcess.on('exit', () => {
    try {
      fs.unlinkSync(filePath)
    }
    catch {}
  })
  process.on('exit', () => {
    try {
      fs.unlinkSync(filePath)
    }
    catch {}
  })
}
