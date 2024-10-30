import type { HandlerContext } from './handler-context'
import { BackendContainer } from './backend-container'

export abstract class AbstractHttpAdapter<ServerInstance = any> extends BackendContainer {
  /**
   * ### Listen for incoming requests.
   *
   * The adapter should call the `listen` method of the underlying server.
   * This method should be called when the server is ready to start accepting connections.
   * The server should start accepting new connections and handle existing connections.
   *
   * @abstract
   * @param port The port number to listen on.
   * @param {() => any} [callback] The callback to be called after the server starts listening.
   * @return {Promise<void>}
   * @memberof AbstractHttpAdapter
   */
  abstract listen(port: number, callback?: () => any): Promise<any>
  /**
   * ### Close the server.
   *
   * The adapter should call the `close` method of the underlying server.
   * This method should be called when the server is shutting down.
   * The server should stop accepting new connections and close all existing connections.
   *
   * @abstract
   * @return {Promise<void>}
   * @memberof AbstractHttpAdapter
   */
  abstract close(): Promise<void>
  /**
   * ### Setup the request handler.
   *
   * Like Node.js HTTP server, the request handler should be a function that accepts a request and returns a response.
   * @example
   * ```typescript
   * import { transformIncomingMessageToRequest, sendResponse } from '@nailyjs/backend/utils'
   *
   * class MyNodeJsHttpAdapter extends AbstractHttpAdapter {
   *  setupHandler(callback: HttpHandlerCallback) {
   *    this.server.on('request', async (req, res) => {
   *      const request = await transformIncomingMessageToRequest(req).getRequest()
   *      const response = await callback(request)
   *      return sendResponse(response, res).send()
   *    })
   *  }
   * }
   * ```
   * Some adapter utils are provided to help with the request and response transformation, please refer to the `@nailyjs/backend/utils` child package.
   *
   * @abstract
   * @param {HandlerContext} context The handler context, please see {@linkcode HandlerContext} for more information.
   * @return {(void | Promise<void>)}
   * @memberof AbstractHttpAdapter
   */
  abstract setupHandler(context: HandlerContext): void | Promise<void>
  /**
   * ### Get the underlying server instance.
   *
   * The adapter should return the underlying server instance. It can be used to access the server instance directly.
   *
   * @abstract
   * @return {ServerInstance}
   * @memberof AbstractHttpAdapter
   */
  abstract getInstance(): ServerInstance
}
