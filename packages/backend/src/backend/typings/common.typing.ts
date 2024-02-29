import { Type } from "@nailyjs/core";
import { IAdapterType } from "./adapter.typing";

export type IPipeParamType = "params" | "query" | "body";

export interface IArgHost {
  /**
   * Get the request object.
   *
   * If the adapter type is `context`, the request object will be undefined.
   *
   * @memberof IBeforeRequestArgHost
   */
  getResponse(): any;
  /**
   * Get the response object.
   *
   * If the adapter type is `context`, the response object will be undefined.
   *
   * @memberof IBeforeRequestArgHost
   */
  getRequest(): any;
  /**
   * Get the context object.
   *
   * If the adapter type is `separate`, the context object will be undefined.
   *
   * @memberof IBeforeRequestArgHost
   */
  getContext(): any;
  /**
   * Get the adapter type.
   *
   * @return {IAdapterType}
   * @memberof IBeforeRequestArgHost
   */
  getAdapterType(): IAdapterType;
}

export interface IPipeArgHost extends IArgHost {
  /**
   * Get the type of the parameter.
   *
   * @return {("params" | "query" | "body")}
   * @memberof IPipeArgHost
   */
  getParamType(): IPipeParamType;
  /**
   * Get the TypeScript design type of the parameter.
   *
   * @memberof IPipeArgHost
   */
  getParamDesignType(): any;
}

export interface IGuardArgHost extends IArgHost {
  getTarget(): Type;
  getInstance(): any;
  getMethodKey(): string | symbol;
}

export interface IFilterHost extends IArgHost {}

export interface ImplNailyBackendPipe {
  /**
   * ### Transform the request data
   *
   * When the request reaches the controller, the transform method of each plugin will be called in turn.
   *
   * @param {IPipeArgHost} argHost - The host of before request.
   * @memberof ImplNailyBackendPipe
   */
  transform(value: unknown, argHost: IPipeArgHost): Promise<any> | any;
}

export interface ImplNailyBackendGuard {
  /**
   * ### Defend the request
   *
   * When the request reaches the controller, the defend method of each plugin will be called in turn.
   *
   * @param {IGuardArgHost} argHost
   * @return {(Promise<boolean> | boolean)}
   * @memberof ImplNailyBackendGuard
   */
  defend(argHost: IGuardArgHost): void | Promise<void>;
}

export interface ImplNailyBackendFilter {
  /**
   * ### Catch the exception
   *
   * When throwing an exception in the `controller/pipe/guard`, the catch method of each plugin will be called in turn.
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/02/28
   * @param {*} exception - The exception.
   * @param {IFilterHost} argHost - The host of filter.
   * @return {(void | Promise<void>)}
   * @memberof ImplNailyBackendFilter
   */
  catch(exception: any, argHost: IFilterHost): void | Promise<void>;
}
