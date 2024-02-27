---
title: 最小化的后端示例
---

我们将从一个空白的文件夹开始，然后添加一个简单的 `Hello, World!` 程序。

首先得有`node`和`pnpm`，然后在你认为合适的位置创建一个文件夹，然后在终端中进入该文件夹，然后运行以下命令：

```bash
pnpm init
```

> 其他包管理器也可以，但是我们推荐使用 `pnpm`。

这将创建一个 `package.json` 文件，然后我们可以安装一些包:

```bash
# 安装Express
pnpm i typescript express @types/express

# 安装核心包
pnpm i @nailyjs/core @nailyjs/backend @nailyjs/backend-express

# 可以安装`tsx`来直接运行ts文件，或者您可以结合其他打包工具来使用
# 我们这边方便演示，直接使用`tsx`来运行
pnpm i tsx
```

然后我们创建一个 `src` 文件夹，然后在里面创建一个 `main.ts` 文件，然后添加以下代码：

```typescript
import { ExpressBootStrap } from "@nailyjs/backend-express";
import { Controller, Get } from "@nailyjs/backend";
import { InjectValuePlugin } from "@nailyjs/core/backend";
import { AddressInfo } from "net";

@Controller()
export class NailyApplication extends ExpressBootStrap {
  @Get()
  public test() {
    return "Hello World!!!";
  }
}

new NailyApplication()
  // 启用注入值插件 必须
  // ExpressBootStrap会读取配置文件内的数据 比如端口号等
  .usePlugin(new InjectValuePlugin())
  .run()
  .then((server) => {
    console.log(`Server is running on port ${(server.address() as AddressInfo).port}`);
  });
```

然后我们在 `package.json` 中添加以下脚本：

```json
{
  "scripts": {
    "start": "tsx src/main.ts"
  }
}
```

然后我们就可以运行 `pnpm start` 来启动我们的后端服务了。

此时，我们的后端服务已经启动，我们可以在浏览器中访问 `http://localhost:3000` 来查看我们的 `Hello World!` 了。

这就是一个最小化的后端示例，你可以在此基础上进行扩展，添加更多的功能。
