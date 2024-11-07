<div align="center">
<br />

<img src="https://universervice.oss-cn-guangzhou.aliyuncs.com/logo.png" width="150" />

# Naily

Naily is a IOC framework written in TypeScript.

[![CI](https://github.com/nailyjs/core/actions/workflows/test.yml/badge.svg)](https://github.com/nailyjs/core/actions/workflows/test.yml)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/nailyjs/core)
![GitHub repo size](https://img.shields.io/github/repo-size/nailyjs/core)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/nailyjs/core)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/nailyjs/core/v2?label=Main%20Branch%20Last%20Commit)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/nailyjs/core/test.yml)
</div>

## 🚀 特性

- 🖊️ **TypeScript**: 使用 TypeScript 编写，提供完整的类型定义
- 🚀 **轻量级**: 体积小，核心容器除`reflect-metadata`外几乎无任何外来依赖包
- 🪜 **跨平台**: 核心容器在服务端/浏览器均可运行；后端适配包等通过`adapter`也不局限于环境，并且尝试让性能最大化，与前端生态接轨，支持`vite dev server`/`node.js`/`bun（正在适配中）`等运行时
- ✨ **与原生契合**: Restful控制器使用原生[new Response](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)发送请求,同时`naily`内部也是采用的原生[Request](https://developer.mozilla.org/zh-CN/docs/Web/API/Request)对象，与原生完全接轨
- 📦 **unplugin-rpc**: 吸取[cell.js](https://github.com/cellbang/cell)的`@celljs/rpc`之精髓，将其注入[unplugin](https://github.com/unplugin)生态，让任何`vite`前端项目都可以尝试到绝对类型安全的后端开发！
- 🛠 **插件化**: 支持插件机制，可以自定义扩展功能
- 🚪 **极为开放的核心**: 不像[inversify.js](https://github.com/inversify/InversifyJS)、[nest.js](https://github.com/nestjs/nest)等一众ioc框架将容器实现藏得很深，拥有极简的容器设计和极为flexable的API，每个人都可以操纵容器的各个边边角角，让ioc的设计理念和理解成本降低
- ⚙️ **约定大于配置**: 参考[cell.js](https://github.com/cellbang/cell)的设计理念 + 目前前端生态的情况，尽量减少配置过程，每个包内部都有一套现成的默认配置。需要自定义配置时，遵循`程序内部重写的类` > `配置文件naily.config.ts` > `默认配置`的优先级，让开发者更专注于业务逻辑

## 📄 License

MIT
