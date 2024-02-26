import { INailyContainerMapValue, ImplNailyPlugin, InitFactory, NailyContainer, Type } from "@nailyjs/core";
import { NailyExpressConstant } from "../constants";
import { Request, Response, Router } from "express";
import { IExpressMapping } from "../typings/metadata.typing";

export class NailyExpressPlugin implements ImplNailyPlugin {
  constructor(
    private readonly pluginCtx: ImplNailyPlugin[],
    private readonly app: Router,
  ) {}

  preDefineCreateInjectable<T>(target: Type<T>, container: NailyContainer): INailyContainerMapValue {
    const router = Reflect.getMetadata(NailyExpressConstant.CONTROLLER, target);
    if (router) {
      return { target, instance: new InitFactory(target, container, this.pluginCtx).getInstance() };
    } else {
      return { target };
    }
  }

  afterCreateInjectable<T>(target: Type<T>, instance: T): Object {
    const router: Router = Reflect.getMetadata(NailyExpressConstant.CONTROLLER, target);
    if (!router) return instance;
    const methodKeys = Reflect.ownKeys(target.prototype).filter((key) => key !== "constructor");
    for (const methodKey of methodKeys) {
      const mappings: IExpressMapping[] = Reflect.getMetadata(NailyExpressConstant.MAPPING, target.prototype, methodKey);
      if (!mappings) continue;
      if (!Array.isArray(mappings)) continue;

      for (const mapping of mappings) {
        const method = mapping.method.toLowerCase();
        router[method](mapping.path, async (req: Request, res: Response) => {
          const result = await instance[methodKey]();
          res.send(result);
        });
      }
    }
    this.app.use(router);
    return instance;
  }
}
