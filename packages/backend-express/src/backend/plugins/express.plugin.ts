import { INailyContainerMapValue, ImplNailyPlugin, InitFactory, NailyContainer, Type } from "@nailyjs/core";
import { Request, Response, Router } from "express";
import { INailyControllerMetadata, INailyControllerMapping, NailyBackendConstant } from "@nailyjs/backend";
import { join } from "path";

export class NailyExpressPlugin implements ImplNailyPlugin {
  constructor(
    private readonly pluginCtx: ImplNailyPlugin[],
    private readonly app: Router,
  ) {}

  private urlPath(controllerPath: string, mapping: string): string {
    return join("/" + controllerPath, mapping).replace(/\\/g, "/");
  }

  preDefineCreateInjectable<T>(target: Type<T>, container: NailyContainer): INailyContainerMapValue {
    const router = Reflect.getMetadata(NailyBackendConstant.CONTROLLER, target);
    if (router) {
      return { target, instance: new InitFactory(target, container, this.pluginCtx).getInstance() };
    } else {
      return { target };
    }
  }

  afterCreateInjectable<T>(target: Type<T>, instance: T): Object {
    const controller: INailyControllerMetadata = Reflect.getMetadata(NailyBackendConstant.CONTROLLER, target);
    if (!controller || !controller.path) return instance;
    const methodKeys = Reflect.ownKeys(target.prototype).filter((key) => key !== "constructor");
    const router = Router();

    for (const methodKey of methodKeys) {
      const mappings: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target.prototype, methodKey);
      if (!mappings) continue;
      if (!Array.isArray(mappings)) continue;

      for (const mapping of mappings) {
        const method = mapping.method.toLowerCase();
        router[method](this.urlPath(controller.path, mapping.path), async (req: Request, res: Response) => {
          const result = await instance[methodKey]();
          res.send(result);
        });
      }
    }

    this.app.use(router);
    return instance;
  }
}
