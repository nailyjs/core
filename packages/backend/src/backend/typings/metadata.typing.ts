import { Type } from "@nailyjs/core";
import { ImplNailyBackendPipe } from "./common.typing";

export const enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  ALL = "ALL",
}

export interface INailyControllerMapping {
  method: RequestMethod;
  path: string;
}

export interface INailyControllerMetadata {
  path: string;
  version?: string;
}

export const enum INailyParameter {
  Query = "query",
  Body = "body",
  Params = "params",
  Headers = "headers",
  Ip = "ip",
  Ips = "ips",
  Request = "request",
  Response = "response",
  Next = "next",
  Context = "context",
}

export interface INailyParameterMetadata {
  designType: any;
  type: INailyParameter;
  pipes?: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[];
}
