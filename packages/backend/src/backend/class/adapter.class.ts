import { IAdapterRequestHandler } from "../typings";

export abstract class AbstractNailyBackendAdapter {
  /**
   * ### Handler
   *
   * Get the class metadata & factory/container to use in adapter.
   *
   * @abstract
   * @template T
   * @param {IAdapterRequestHandler<T>} requestHandler
   * @memberof AbstractNailyBackendAdapter
   */
  abstract handler<T>(requestHandler: IAdapterRequestHandler<T>): void;
}
