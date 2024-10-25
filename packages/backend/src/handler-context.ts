import type { SkipHandle } from './constant'
import { BackendContainer } from './backend-container'

export interface HandlerRequest extends Request {}

export interface HandlerResponse extends Response {}

export abstract class HandlerContext extends BackendContainer {
  /**
   * ### The request handler callback.
   *
   * The callback should be a function that accepts a request and returns a response.
   * It will be run by the adapter when a new request is received.
   *
   * For the sake of generality, we directly compatible with the native Request and
   * Response objects, so that developers can more easily use existing HTTP frameworks
   * and JavaScript runtime environments.
   *
   * If you want to create a new `HandlerContext`, you can extend this class.
   * When the Bootstrap class is initialized, the `callback` method will be called by the adapter.
   *
   * @param {HandlerRequest} request The request object is compatible with the native {@linkcode Request} object.
   * @return {(HandlerResponse | Promise<HandlerResponse>)} The response object is compatible with the native {@linkcode Response} object.
   * @see Request object: [MDN Reference](https://developer.mozilla.org/zh-CN/docs/Web/API/Request)
   * @see Response object: [MDN Reference](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)
   * @memberof HandlerContext
   */
  abstract callback(request: HandlerRequest): HandlerResponse | typeof SkipHandle | Promise<HandlerResponse | typeof SkipHandle>
  /**
   * ### Handle the {@linkcode callback} `error`.
   *
   * {@linkcode callback} method should be wrapped in a try-catch-finally block, and the error should be passed to this method.
   * This method will be called when an error occurs in the {@linkcode callback} method.
   *
   * @abstract
   * @param {unknown} error The error object.
   * @param {...any[]} args The arguments passed to the {@linkcode callback} method.
   * @return {(void | Promise<void>)}
   * @memberof HandlerContext
   */
  abstract catchError(error: unknown, ...args: any[]): any | Promise<any>
  /**
   * ### Handle the {@linkcode callback} `finally`.
   *
   * {@linkcode callback} method should be wrapped in a try-catch-finally block, and this method will be called after the {@linkcode callback} method.
   * This method will be called when the {@linkcode callback} method is finished.
   *
   * @abstract
   * @param {...any[]} args The arguments passed to the {@linkcode callback} method.
   * @return {(void | Promise<void>)}
   * @memberof HandlerContext
   */
  abstract catchFinally(...args: any[]): any | Promise<any>
}
