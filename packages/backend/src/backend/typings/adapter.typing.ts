import { InitFactory, NailyContainer, Type } from "@nailyjs/core";
import { INailyControllerMapping, INailyControllerMetadata } from "./metadata.typing";

export interface IAdapterRequestHandlerGetMethod {
  result: unknown;
  isResponse: boolean;
}

export const enum IAdapterType {
  Separate = "separate",
  Context = "context",
}

export interface IAdapterRequestHandlerGetMethodCommonCallback {
  params: any;
  query: any;
  body: any;
  headers: any;
  ip: any;
  ips: any;
  next: any;
}

export interface IAdapterRequestHandlerGetMethodSeparateCallback extends IAdapterRequestHandlerGetMethodCommonCallback {
  adapterType: IAdapterType.Separate;
  request: any;
  response: any;
}

export interface IAdapterRequestHandlerGetMethodContextCallback extends IAdapterRequestHandlerGetMethodCommonCallback {
  adapterType: IAdapterType.Context;
  context: any;
}

export type IAdapterRequestHandlerGetMethodCallback =
  | IAdapterRequestHandlerGetMethodSeparateCallback
  | IAdapterRequestHandlerGetMethodContextCallback;

export interface IAdapterRequestHandler<T extends Object> {
  getFactory(): InitFactory<T>;
  getContainer(): NailyContainer;
  getMethodKey(): string | symbol;
  getMethodMapping(): INailyControllerMapping;
  getControllerMapping(): INailyControllerMetadata;
  runMethod(adapterMetadata: IAdapterRequestHandlerGetMethodCallback): Promise<IAdapterRequestHandlerGetMethod>;
  getRawController(): Type<T>;
  getRawInstance(): T;
}
