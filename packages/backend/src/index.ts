/**
 * # `@nailyjs/backend`
 *
 * The backend package of naily, provides the http server backend features. It can support `node`/`deno`/`bun` and more environments using different adapters.
 *
 * ## Note for users
 *
 * If you quickly start, you can see `@nailyjs/backend/node-adapter` for the node adapter.
 *
 * @module
 * @example
 * ```typescript
 * import { BackendBootstrap } from '@nailyjs/backend'
 *
 * const app = new BackendBootstrap()
 * app.setBackendAdapter(
 *   // Your custom or internal adapter
 * )
 * app.run()
 * ```
 */

export * from './backend-bootstrap'
export * from './constant'
export * from './contexts'
export * from './contexts'
export * from './decorators'
export * from './factories'
export * from './handler-request'
export * from './pipes'
export * from './services'
export * from './types'
export * from './wrappers'
