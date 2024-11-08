import type { FilterPattern } from '@rollup/pluginutils'
import path from 'node:path'
import { createFilter } from '@rollup/pluginutils'
import { JscConfig, Options as SwcRawOptions, transform, TransformConfig } from '@swc/core'
import { defu } from 'defu'
import { loadTsConfig } from 'load-tsconfig'
import { createUnplugin, UnpluginFactory } from 'unplugin'
import { defaultSwcOptions } from './def'
import { resolveId } from './resolve'

export type SwcOptions = SwcRawOptions & {
  include?: FilterPattern
  exclude?: FilterPattern
  tsconfigFile?: string | boolean
}

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
}

type SWCOptions = WithRequiredProperty<JscConfig, 'parser' | 'transform'>

export const swcUnplugin: UnpluginFactory<SwcOptions | undefined> = (options) => {
  if (!options) options = defaultSwcOptions
  const { include, exclude, tsconfigFile, minify } = options

  const filter = createFilter(
    include || /\.m?[jt]sx?$/,
    exclude || /node_modules/,
  )

  return {
    name: 'swc',

    resolveId,

    async transform(code, id) {
      if (!filter(id))
        return null

      const compilerOptions
        = tsconfigFile === false
          ? {}
          : loadTsConfig(
            path.dirname(id),
            tsconfigFile === true ? undefined : tsconfigFile,
          )?.data?.compilerOptions || {}

      const isTs = /\.m?tsx?$/.test(id)

      let jsc: SWCOptions = {
        parser: {
          syntax: isTs ? 'typescript' : 'ecmascript',
        },
        transform: {},
      }

      if (compilerOptions.jsx) {
        if (jsc.parser.syntax === 'typescript') {
          jsc.parser.tsx = true
        }
        else {
          jsc.parser.jsx = true
        }
        Object.assign<TransformConfig, TransformConfig>(jsc.transform, {
          react: {
            pragma: compilerOptions.jsxFactory,
            pragmaFrag: compilerOptions.jsxFragmentFactory,
            importSource: compilerOptions.jsxImportSource,
          },
        })
      }

      if (compilerOptions.experimentalDecorators) {
        // class name is required by type-graphql to generate correct graphql type
        jsc.keepClassNames = true
        jsc.parser.decorators = true
        Object.assign<TransformConfig, TransformConfig>(jsc.transform!, {
          legacyDecorator: true,
          decoratorMetadata: compilerOptions.emitDecoratorMetadata,
        })
      }

      if (compilerOptions.target) {
        jsc.target = compilerOptions.target
      }

      if (options.jsc) {
        jsc = defu<SWCOptions, SWCOptions[]>(options.jsc, jsc)
      }

      const result = await transform(code, {
        filename: id,
        sourceMaps: true,
        ...options,
        jsc,
      })
      return {
        code: result.code,
        map: result.map && JSON.parse(result.map),
      }
    },

    vite: {
      enforce: 'pre',

      config(config) {
        if (!config) config = {}
        config.esbuild = false
        return config
      },
    },

    rollup: {
      async renderChunk(code, chunk) {
        if (minify) {
          const result = await transform(code, {
            sourceMaps: true,
            minify: true,
            filename: chunk.fileName,
          })
          return {
            code: result.code,
            map: result.map,
          }
        }
        return null
      },
    },
  }
}

export const swc = createUnplugin(swcUnplugin)
export default swc
export * from './def'
