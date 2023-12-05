import { Bean, Type } from "@nailyjs/core";
import { NailyBackendWatermark } from "../constants";

export function RestController<T>(path: string = "/", extraOptions: Partial<Omit<NBackend.ControllerMetadataWithBean, "path">> = {}) {
  return (target: Type<T>) => {
    Bean({
      Scope: extraOptions.Scope,
      Token: extraOptions.Token,
    })(target);
    const metadata: NBackend.ControllerMetadata = {
      path: path,
      version: extraOptions.version ? extraOptions.version : "",
    };
    Reflect.defineMetadata(NailyBackendWatermark.CONTROLLER, metadata, target);
  };
}
