# RPC 指南

## 介绍

Naily.js的RPC其实就是把[cell.js](https://github.com/cellbang/cell)的RPC抽取了出来，并且接入了unplugin插件系统。但是我还是为了这盘醋包了饺子，自己写了一个轻量、扩展性应该还挺高的IOC容器。

之所以不用cell.js核心的包，原因有两个：

- 个人觉得cell.js的IOC容器有点重了（其内部封装了[InversifyJS](https://github.com/inversify/InversifyJS)这个框架）；
- 目前它的工具链固化在了webpack上，其维护者如果想要将其支持vite等一众工具链，需要做很大的改动（几乎得重写整个`@celljs/cli`以及`@celljs/cli-*`系列所有的包），难度较大，工作量也较大，社区人力资源也有限。

但是不得不说，其的一些理念还是特别鲜明可取的，比如它内置的基于[JSON RPC 2.0](https://www.jsonrpc.org/specification)的RPC系统，其范式让`interface`和`implements`这两个`TypeScript`关键字发挥了它们真正的作用，即：

- `interface`即接口，用来桥接前后端代码的通信;
- `implements`即实现，用来实现接口的具体逻辑。

同时其还实现了直接的类型安全，实在是两全其美。话不多说，我们直接看cell.js的RPC系统是如何使用的：

```typescript twoslash
import { Rpc, RpcUtil } from '@celljs/rpc'

// src/common/welcome-server-protocol.ts，这里是通信协议，前后端共享。
// 这个变量可以是一个Symbol，也可以是一个字符串。
// 但是必须要全局唯一，因为这个变量会被用来作为key，来获取对应的接口。
export const WelcomeServer = 'WelcomeServer'
// 通过一个接口，定义了前后端通信的协议
interface WelcomeServer {
  sayHello(name: string): Promise<string>
}
// ----------------------------------------------------------------
// src/backend/welcome-server.ts，这里是后端代码
@Rpc(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
  /**
   * 一个简单的接口实现
   *
   * @param name 名字
   * @returns 欢迎消息
   */
  async sayHello(name: string): Promise<string> {
    return `Hello, ${name}!`
  }
}
// ----------------------------------------------------------------
// src/frontend/main.ts，这里是前端代码
// 通过一个泛型，让RpcUtil知道我们要调用的接口是什么，这样就可以进行类型检查了
const welcomeServer = RpcUtil.get<WelcomeServer>(WelcomeServer)
// 调用后端的接口，这里的类型检查是自动的，包括传入的参数
// 其内部使用axios进行通信
welcomeServer.sayHello('cell.js').then(msg => console.log(msg)) // Hello, cell.js!
```

这样，就实现了前后端的通信，而且还是完全类型安全的！而且我们框架内部根本`不需要`任何复杂的`类型推导magic`/`全局宏定义（declare global）`等来实现类型提示，这就是cell.js RPC的魅力所在。

## 全新创建一个Vite项目

如果是Vue下开发，可以直接使用fork antfu大佬的vitesse模版：`vitesse-naily`：

```bash
npm degit nailyjs/vitesse-naily my-vue-app
cd my-vue-app
pnpm install
```

其他框架参考下面的步骤一样可以非常容易地将一个Vite项目改造成一个全栈项目。

## 在已有的Vite项目中使用

Naily.js是`渐进式`的，所以你可以在已有的Vite项目中使用它，只需要安装`unplugin-swc`和`@nailyjs`的一系列包即可：

::: code-group
```bash [npm]
npm install unplugin-rpc @nailyjs/rpc @nailyjs/ioc @nailyjs/backend
```

```bash [yarn]
yarn add unplugin-rpc @nailyjs/rpc @nailyjs/ioc @nailyjs/backend
```

```bash [pnpm]
pnpm add unplugin-rpc @nailyjs/rpc @nailyjs/ioc @nailyjs/backend
```
:::

然后在`vite.config.ts`中配置`unplugin-rpc`即可：

```typescript twoslash
import Rpc from 'unplugin-rpc/vite'
import { defineConfig, type UserConfig } from 'vite'

export default defineConfig({
  plugins: [
    Rpc({
      // 后端入口文件的app导出名，默认是`app`。特别注意最好不用`default`，用默认导出可能会有问题
      entryExport: 'app',
      // 后端入口文件的路径，默认是`./backend/main.ts`。
      serverEntry: './backend/main.ts',
      // 当后端使用`vite build`命令打包时，会采用下面的配置。
      // 这个配置项会与默认的配置项进行合并
      // 默认配置项可以在`unplugin-rpc`的`src/index.ts`下的`buildServer`函数中找到。
      viteOptions: {},
      // 是否在vite关闭时打包后端代码，默认是`true`。
      buildOnViteCloseBundle: true,
    }),
  ],
})
```

::: warning 关于`buildOnViteCloseBundle`

有时候你得调整一下你的配置，比如当你在使用`vite-ssg`打包项目的时候，你可能需要将这个配置项设置为`false`，然后在`vite-ssg`打包完成的`ssgOptions.onFinished`回调中手动build后端代码。此时你可以在`vite.config.ts`中这样配置：

```typescript twoslash
/// <reference types="vite-ssg" />

import Rpc from 'unplugin-rpc/vite'
import { defineConfig } from 'vite'
// 导入这个函数，这个函数执行的时候就会去build后端的代码
import { buildServer } from 'unplugin-rpc'

export default defineConfig({
  plugins: [
    Rpc({
      buildOnViteCloseBundle: false,
      // ... 其他配置
    })
  ],

  // 在vite-ssg打包完成后，手动调用buildServer函数来build后端代码
  ssgOptions: {
    async onFinished() {
      await buildServer()
    }
  }
})
```

你可以参考[vitesse-naily](https://github.com/nailyjs/vitesse-naily/blob/main/vite.config.ts)的`vite.config.ts`文件，看看如何配置`vite-ssg`支持。
:::

你可以看到这个插件的配置文件中定义了`entryExport`和`serverEntry`，所以你得在项目根目录创建`./backend/main.ts`文件，填入如下内容：

```typescript twoslash
// 将vite的环境变量导入到全局
/// <reference types="vite/client" />

import { NodeHttpAdapter } from '@nailyjs/backend/node-adapter'
import { RpcBootstrap } from '@nailyjs/rpc'
// 导入你的服务，这里导入了`./welcome-server.ts`文件
import './welcome-server'

// 创建一个RPC服务，将其命名为`app`变量并导出它，必须要和vite.config.ts中的`entryExport`一致
export const app = new RpcBootstrap(new NodeHttpAdapter())

// 只在生产环境下调用run方法启动服务，开发环境下不需要，也不能调用！
if (import.meta.env.PROD)
  app.run(1000)
```

剩下的使用方法就和`cell.js`大差不差了：

```typescript twoslash
// common/welcome-server-protocol.ts
import { RpcController } from '@nailyjs/rpc'
import { createRpcClient } from '@nailyjs/rpc/axios'

export const WelcomeServer = 'WelcomeServer'
interface WelcomeServer {
  sayHello(name: string): Promise<string>
}

// backend/welcome-server.ts
@RpcController(WelcomeServer)
export class WelcomeServerImpl {
  async sayHello(name: string): Promise<string> {
    return `Hello, ${name}!`
  }
}

// src/main.ts
const client = createRpcClient(WelcomeServer)
client.request<WelcomeServer>(WelcomeServer)
  .sayHello('naily.js')
  .then(msg => console.log(msg)) // Hello, naily.js!
```

几乎没有任何区别：

- cell.js的`@Rpc`装饰器改成了`@RpcController`（为了更加迎合后端`控制器`这个概念，不介意多打一个单词）；
- cell.js的`RpcUtil.get`方法改成了`createRpcClient.request`方法。

这样，你就可以在已有的Vite项目中使用这个非常舒服的简易JSON RPC系统了。
