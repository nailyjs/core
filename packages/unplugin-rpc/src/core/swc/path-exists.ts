import fs, { promises as fsPromises } from 'node:fs'

export async function pathExists(path: string): Promise<boolean> {
  try {
    await fsPromises.access(path)
    return true
  }
  catch {
    return false
  }
}

export function pathExistsSync(path: string): boolean {
  try {
    fs.accessSync(path)
    return true
  }
  catch {
    return false
  }
}
