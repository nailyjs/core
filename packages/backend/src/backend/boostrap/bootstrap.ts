import { AbstractBootstrap, Type } from "@nailyjs/core";
import { ImplNailyBackendGuard, ImplNailyBackendPipe } from "../typings";
import { NailyBackendPlugin } from "../plugins/backend.plugin";
import { AbstractNailyBackendAdapter } from "../class/adapter.class";

export abstract class AbstractNailyBackendBootStrap<T> extends AbstractBootstrap<T> {
  private readonly backendPipe: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[] = [];
  private readonly backendGuard: (ImplNailyBackendGuard | Type<ImplNailyBackendGuard>)[] = [];

  /**
   * ### Use backend pipe
   *
   * Use the backend pipe. The backend pipe will be called when the request reaches the controller.
   *
   * @param {ImplNailyBackendPipe} pipe - The backend pipe to use.
   * @return {this}
   * @memberof AbstractNailyBackendBootStrap
   */
  public useBackendPipe(pipe: ImplNailyBackendPipe | Type<ImplNailyBackendPipe>): this {
    this.backendPipe.push(pipe);
    return this;
  }

  public useBackendGuard(guard: ImplNailyBackendGuard | Type<ImplNailyBackendGuard>): this {
    this.backendGuard.push(guard);
    return this;
  }

  /**
   * ### Get app
   *
   * Get the app instance.
   *
   * @abstract
   * @return {*}
   * @memberof AbstractNailyBackendBootStrap
   */
  public abstract getApp(): any;

  /**
   * ### Init adapter
   *
   * Init the adapter must use in the `bootstrap class's run method`.
   *
   * @protected
   * @param {AbstractNailyBackendAdapter} adapter - The adapter to use.
   * @memberof AbstractNailyBackendBootStrap
   */
  protected initAdapter(adapter: AbstractNailyBackendAdapter) {
    super.enableInternalPlugin();
    super.usePlugin(new NailyBackendPlugin(adapter, this.backendPipe, this.backendGuard));
  }
}
