---
title: 从空文件夹开始
sidebar:
  order: 3
---

> 我们不推荐此种方式来构建您的项目。但是如果您需要极高的自定义构建器（如换成Webpack等打包器）的时候，也只能从0开始构建项目。

> esbuild和babel两者因为各种原因，对`reflect-metadata`的支持不是很好。建议在编译装饰器时使用`TypeScript官方编译器tsc`进行编译。

> 至于Naily的CLI`@nailyjs/cli`，使用的打包器是`rollup`，实际上rollup的TypeScript插件就是官方的`tsc`编译。

这篇文章我们会从零开始搭建一个只有 Naily 核心的 Node.js 项目。

Windows 下打开 cmd 或 powershell，MacOS 下打开终端，一起开始吧～

## 创建package.json

创建一个空白文件夹并 cd 到该文件夹中，使用命令：

```bash
pnpm init
```

创建一个 package.json 文件。我们推荐使用 `pnpm` 来安装和管理依赖。

## 添加文件

再在目录下创建一个 src 文件夹，src 文件夹下创建一个 `main.ts` 文件。我们的应用程序将以这个文件为入口点开始执行。

再在文件夹根目录创建一个 tsconfig.json 文件和一个 naily.yaml 文件。

- `naily.yml` 文件是整个 Naily 项目的配置文件，必须要有（哪怕内容是空的）；
- `tsconfig.json` 文件是 TypeScript 的配置文件，文件内容可参考下面的示例：

```json
{
  "compilerOptions": {
    // 实验性装饰器选项必须打开
    "experimentalDecorators": true,
    // 反射Metadata类型，必须打开
    "emitDecoratorMetadata": true,
    // 定义文件输出目录
    "outDir": "dist",
    // 注意：target必须为ES2021或以下，ES2022以上无法使用Naily
    "target": "ES2021",
    "module": "CommonJS",
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

## 安装依赖

```bash
# TypeScript，必须装
pnpm install -D typescript
# Node.js类型包，装了才有智能提示
pnpm install -D @types/node
# Naily核心包，必须装
pnpm install @nailyjs/core
# Naily的命令行工具，装了才有`naily`命令
pnpm install -D @nailyjs/cli
```

安装好了之后，可以修改一下`package.json`的`scripts`字段如下：

```json
{
  "scripts": {
    "start": "naily build && node .naily/cjs/main.js"
  }
}
```

然后我们再在根目录创建一个`naily.yml`文件，内容如下：

```yml
naily:
  cli:
    src: src/
    output: .naily
```

我们将以 src/main.ts 为入口点开始撰写我们的业务代码。运行时，只要执行：

```bash
pnpm start
```

即运行成功。
