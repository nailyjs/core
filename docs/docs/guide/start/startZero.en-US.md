---
order: 2
group:
  title: Start
---

# Getting Started

This article will start from scratch to build a Node.js project with only the Naily core.

Windows open cmd or powershell, MacOS open terminal, let's start together~

创建一个空白文件夹
cd 到该文件夹中，使用命令：
pnpm init
创建一个 package.json 文件。我们推荐使用 pnpm 来安装和管理依赖。
再在目录下创建一个 src 文件夹，src 文件夹下创建一个 main.ts 文件。
再在文件夹根目录创建一个 tsconfig.json 文件和一个 naily.yaml 文件。

- naily.yaml 文件是整个 Naily 项目的配置文件，必须要有（哪怕内容是空的）；
- tsconfig.json 文件是 TypeScript 的配置文件，文件内容可参考下面的示例：
