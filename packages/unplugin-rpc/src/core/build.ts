import path from 'node:path'
import { cwd } from 'node:process'
import { build, mergeConfig, UserConfig } from 'vite'
import { Options } from '../types'
import { swc } from './swc'

export async function buildServer(options?: Options | undefined): Promise<void> {
  const serverEntry = options?.serverEntry || path.join(cwd(), './backend/main.ts')
  const viteOptions = options?.viteOptions || {}

  await build(mergeConfig({
    build: {
      ssr: serverEntry,
      ssrManifest: true,
      outDir: 'dist/backend',
    },

    plugins: [
      swc(),
    ],
  } as UserConfig, viteOptions))
}
