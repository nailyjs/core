import { defineConfig } from "dumi";

export default defineConfig({
  title: "Naily",
  favicon: "/logo_minmal.png",
  logo: "/logo_minmal.png",
  outputPath: "docs-dist",
  mode: "site",
  ssr: {},
  exportStatic: {},
  dynamicImport: {},
  sitemap: {
    hostname: "https://naily.cc",
  },
  locales: [
    ["zh-CN", "中文"],
    ["en-US", "English"],
  ],
  navs: {
    "zh-CN": [
      null,
      // {
      //   title: "指南",
      //   path: "/guide",
      // },
      // {
      //   title: "参考",
      //   path: "/reference",
      //   children: [
      //     {
      //       title: "核心",
      //       path: "/reference/core",
      //     },
      //     {
      //       title: "Web",
      //       path: "/reference/web",
      //     },
      //   ],
      // },
    ],
    "en-US": [
      {
        title: "Guide",
        path: "/en-US/guide",
      },
      {
        title: "Reference",
        path: "/reference",
      },
    ],
  },
  // more config: https://d.umijs.org/config
});
