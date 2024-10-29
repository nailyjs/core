# Restful 指南

传统的Restful API同样受Naily.js支持。和`Spring`/`Cell.js`/`Nest.js`/`Midway.js`等一众`IOC框架`一样，Naily.js也提供了一套`Restful`的编程模型。

::: tip 注意
虽然Naily.js支持Restful API，但是我们更主推`Naily RPC`。Restful的理念长久以来一直受到争议，如果是新项目，我们更推荐使用`Naily RPC`，方便快捷创建全栈应用。
:::

## 创建 Restful API

类似其他的`IOC`框架，我们可以通过 `@RestController` `@Get` 等来创建一个Restful API。

```typescript twoslash
// welcome.controller.ts
import { Get, RestController } from '@nailyjs/backend'

@RestController()
export class UserController {
  @Get()
  getUsers() {
    return 'Hello, World!'
  }
}
```

## 启动应用程序

`naily.js`内部参考`nest.js`的架构提供了一个`Adapter`，但是这个`Adapter`架构默认不和`nest.js`一样用来切换`express`/`fastify`等底层框架，而是用来切换`node.js`/`bun`/`deno`等运行时环境的。

比如下面一个例子，我们从`@nailyjs/backend`的分包`node-adapter`中导入`NodeBootstrap`，就可以在`node.js`环境下创建一个`HTTP`服务器并启动它了。

```typescript twoslash
// main.ts
import { NodeBootstrap } from '@nailyjs/backend/node-adapter'
import './welcome.controller'

new NodeBootstrap()
  .run(3000)
  .then(() => console.log(`Backend started on port http://localhost:3000`))
```

创建好了服务器，我们需要导入刚刚我们在`welcome.controller.ts`中创建的`UserController`，这样我们的`UserController`才能被`NodeBootstrap`扫描到。

::: tip
目前`naily.js`只支持`node.js`环境，后续会支持更多的运行时环境，如`bun`等。

以后我们会提供更多的`Adapter`，比如`node-express-adapter`/`node-fastify-adapter`等，但是大概率不会封装在`@nailyjs/backend`中，而是单独的分包。
:::

同样这里也是参考了`cell.js`的机制，但是启动器这块比`cell.js`的`export default autoBind()`更加的透明，不会让初学者抓不着头脑。
