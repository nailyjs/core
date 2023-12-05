import { INailyControllerRegistry } from "@nailyjs/backend";
import { Autowired, NailyBeanFactory, NailyBeanRegistry, Service } from "@nailyjs/core";
import { Request, Router } from "express";

@Service()
export class MethodAnalyseService {
  private async initVariablePipe<T>(req: Request, param: NBackend.PipeParamMetadata, type: "params" | "query" | "body" | "headers"): Promise<T> {
    if (param.id) {
      for (let pipe of param.pipes) {
        if (typeof pipe === "function") pipe = new NailyBeanFactory(pipe).createInstance();
        req[type][param.id] = await pipe.transform(req[type][param.id], param);
      }
      return req[type][param.id];
    } else {
      for (let pipe of param.pipes) {
        if (typeof pipe === "function") pipe = new NailyBeanFactory(pipe).createInstance();
        req[type] = await pipe.transform(req[type], param);
      }
      return req[type];
    }
  }

  public route(router: Router, controller: INailyControllerRegistry, propertyKey: string | symbol, instance: any) {
    for (const i in controller.methods[propertyKey].methods) {
      const { method, path } = controller.methods[propertyKey].methods[i];

      // 注册路由
      router[method](path, async (req, res) => {
        const params = controller.methods[propertyKey].params;
        const parameters = [];
        for (const k in params) {
          const param = params[k];

          switch (param.type) {
            case "param":
              const analysedParams = await this.initVariablePipe(req, param, "params");
              parameters.push(analysedParams);
              break;

            case "query":
              const analysedQuery = await this.initVariablePipe(req, param, "query");
              parameters.push(analysedQuery);
              break;

            case "body":
              const analysedBody = await this.initVariablePipe(req, param, "body");
              parameters.push(analysedBody);
              break;

            case "headers":
              const analysedHeaders = await this.initVariablePipe(req, param, "headers");
              parameters.push(analysedHeaders);
              break;

            case "ip":
              parameters.push(req.ip);
              break;

            case "req":
              parameters.push(req);
              break;

            case "res":
              parameters.push(res);
              break;
          }
        }

        const value = await instance[propertyKey](...parameters);
        res.send(value).end();
      });
    }
  }
}

@Service()
export class AnalyseService {
  constructor(private readonly mapper: INailyControllerRegistry[]) {}

  @Autowired()
  private readonly methodAnalyseService: MethodAnalyseService;

  private controllerAnalyse(controller: INailyControllerRegistry): Router {
    // 创建express router
    const router = Router();
    // 获取注册表元素
    const element = NailyBeanRegistry.getRegistry().get(controller.beanToken);
    // 初始化工厂
    const factory = new NailyBeanFactory(element.target);
    // 获取实例
    const instance = factory.createInstance();
    // 遍历controller的方法们
    for (const propertyKey in controller.methods) {
      this.methodAnalyseService.route(router, controller, propertyKey, instance);
    }
    return router;
  }

  public analyse(): Router[] {
    const results: Router[] = [];
    // 遍历controller们
    for (const controller of this.mapper) {
      const router = this.controllerAnalyse(controller);
      results.push(router);
    }
    return results;
  }
}
