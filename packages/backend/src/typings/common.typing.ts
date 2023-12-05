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
  }
}

export {};
