# unplugin-rpc

[![NPM version](https://img.shields.io/npm/v/unplugin-rpc?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-rpc)

A plugin to bring naily.js style JSON-RPC to your Vite, Nuxt, Astro, and more.

## Install

```bash
npm i unplugin-rpc
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Starter from 'unplugin-rpc/vite'

export default defineConfig({
  plugins: [
    Starter({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    ['unplugin-rpc/nuxt', { /* options */ }],
  ],
})
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details><summary>Astro</summary><br>

```ts
// astro.config.mjs
import Starter from 'unplugin-rpc/astro'

export default {
  integrations: [
    Starter({ /* options */ }),
  ],
}
```
<br></details>

<details>
<summary>Webpack</summary><br>

Currently webpack is not supported, welcome to contribute!

<br></details>

<details>
<summary>Farm</summary><br>

Currently farm is not supported, welcome to contribute!

<br /></details>

## Usage

> ⚠️ When installed this plugin, you must install `@nailyjs/backend`、`@nailyjs/rpc` and `@nailyjs/ioc` in your project.

Create a folder `backend` in your vite project root, and create a file `backend/main.ts`:

```typescript
// backend/main.ts
/// <reference types="vite/client" />

import { NodeHttpAdapter } from '@nailyjs/backend/node-adapter'
import { RpcBootstrap } from '@nailyjs/rpc'
import './welcome-server'

// You must export `app` for the plugin to work.
// you also can configure your export key in the plugin options.
export const app = new RpcBootstrap(new NodeHttpAdapter())

// It will be called when environment is production mode
if (import.meta.env.PROD)
  app.run(1000)
```

Create a file `backend/welcome-server.ts`:

```typescript
// backend/welcome-server.ts

import { RpcController } from '@nailyjs/rpc'
import { WelcomeServer } from '../common/welcome-protocol'

@RpcController(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
  add(a: number, b: number): number {
    return a + b
  }
}
```

You can see the `WelcomeServer` is exported from `../common/welcome-protocol`, so you need to create a file `common/welcome-protocol.ts`:

```typescript
// common/welcome-protocol.ts

// ⚠️ This key must be unique in the project!!!
export const WelcomeServer = 'WelcomeServer'

export interface WelcomeServer {
  add(a: number, b: number): number
}
```

Now the server side is ready, in the client side, you can call the rpc method like this:

```typescript
// src/main.ts
import { createRpcClient } from '@nailyjs/rpc/axios'
import { WelcomeServer } from '../common/welcome-protocol'

const client = createRpcClient()

// It is type safe!
client.request<WelcomeServer>(WelcomeServer)
  // You can call the rpc method like this
  .add(1, 2)
  // It is a promise, you can use `await` or `then`
  .then(result => console.log(result)) // 3
```

Across any frontend files (like `.vue`,`.ts`,`.tsx`) you can call the rpc method, and it is type safe!

## Thanks

- Starter template for [unplugin](https://github.com/unjs/unplugin).
