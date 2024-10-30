import type { PluginOption } from 'vite'
import defu from 'defu'
import * as swcPlugin from 'unplugin-swc'

export function swc(mixed?: swcPlugin.Options): PluginOption {
  const options = defu(mixed || {}, {
    jsc: {
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
        decoratorVersion: '2021-12',
      },
      parser: {
        syntax: 'typescript',
        decorators: true,
        tsx: true,
      },
    },
  } as swcPlugin.Options)

  let swcVitePlugin: typeof import('unplugin-swc').default['vite']
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  if (typeof swcPlugin.default.default === 'object' && typeof swcPlugin.default.default.vite === 'function')
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    swcVitePlugin = swcPlugin.default.default.vite
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  else if (typeof swcPlugin.vite === 'function')
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    swcVitePlugin = swcPlugin.vite
  else swcVitePlugin = swcPlugin.default.vite

  return swcVitePlugin(options)
}
