import { Type } from "@nailyjs/core";
import { IHttpMethod } from "@nailyjs/web";

declare global {
  export namespace NBackend {
    export interface ControllerMetadata {
      path: string;
      version: string;
    }
    export interface ControllerMetadataWithBean extends NIOC.BeanMetadata, ControllerMetadata {}
    export interface MethodMetadata {
      path: string;
      method: IHttpMethod | "all";
    }
    export interface PipeParamMetadata {
      type: "param" | "query" | "body" | "headers";
      id: string;
      pipes: Type[];
    }
    export interface DefaultParamMetadata {
      type: "req" | "res" | "ctx" | "ip";
    }
    export type ParamMetadata = PipeParamMetadata | DefaultParamMetadata;
  }
}

export {};
