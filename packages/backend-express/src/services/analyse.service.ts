import { INailyControllerRegistry } from "@nailyjs/backend";
import { NailyBeanFactory, NailyBeanRegistry, Service } from "@nailyjs/core";
import { Router } from "express";

@Service()
export class AnalyseService {
  constructor(private readonly mapper: INailyControllerRegistry[]) {}

  public analyse(): Router[] {
    const results: Router[] = [];
    // 遍历controller们
    for (const controller of this.mapper) {
      // 创建express router
      const router = Router();
      // 获取实例
      const element = NailyBeanRegistry.getRegistry().get(controller.beanToken);
      const factory = new NailyBeanFactory(element.target);
      const instance = factory.createInstance();
      // 遍历controller的方法们
      for (const propertyKey in controller.methods) {
        for (const j in controller.methods[propertyKey].methods) {
          const { method, path } = controller.methods[propertyKey].methods[j];
          router[method](path, async (req, res) => {
            const value = await instance[propertyKey]();
            res.send(value);
          });
        }
      }
      results.push(router);
    }
    return results;
  }
}
