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
    export type SinglePipe = Type<NBackend.Pipe> | NBackend.Pipe;
    interface PipeParamMetadata {
      type: "param" | "query" | "body" | "headers";
      id: string;
      pipes: SinglePipe[];
      paramtype?: any;
    }
    interface DefaultParamMetadata {
      type: "req" | "res" | "ctx" | "ip";
      paramtype?: any;
    }
    export type ParamMetadata = PipeParamMetadata | DefaultParamMetadata;

    export interface Pipe {
      transform(value: any, metadata: PipeParamMetadata): any;
    }
  }
}

export {};
