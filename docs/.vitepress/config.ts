import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Naily',
  description: 'Simple,extensible IOC framework for TypeScript.',

  markdown: {
    codeTransformers: [
      transformerTwoslash({
        explicitTrigger: true,
        twoslashOptions: {
          compilerOptions: {
            target: ScriptTarget.ES2022,
            module: ModuleKind.ES2022,
            moduleResolution: ModuleResolutionKind.Bundler,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
          },
        },
      }),
    ],
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh',
    },
    // en: {
    //   label: 'English',
    //   lang: 'en',
    // },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: '指南',
        items: [
          { text: 'IOC 指南', link: '/ioc-guide' },
          { text: 'RPC 指南', link: '/rpc-guide' },
          { text: 'Restful 指南', link: '/restful-guide' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'IOC 指南',
        items: [
          { text: '开始使用 IOC', link: '/ioc-guide' },
        ],
      },
      {
        text: 'RPC 指南',
        items: [
          { text: '开始使用 RPC', link: '/rpc-guide' },
        ],
      },
      {
        text: 'Restful 指南',
        items: [
          { text: '开始使用 Restful', link: '/restful-guide' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'npm', link: 'https://www.npmjs.com/org/nailyjs' },
      { icon: 'github', link: 'https://github.com/nailyjs/core' },
    ],
  },

  vite: {
    plugins: [
      UnoCSS(),
    ],
  },
})
