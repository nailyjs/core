import { INailyControllerRegistry } from "@nailyjs/backend";
import { Bean, NailyBeanFactory, Service } from "@nailyjs/core";
import { Request, Router } from "express";

@Service()
export class ExpressMethodAnalyseService {
  @Bean()
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

  @Bean()
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
