import { INailyControllerRegistry } from "@nailyjs/backend";
import { Autowired, Bean, NailyBeanFactory, NailyBeanRegistry, Service } from "@nailyjs/core";
import { Router } from "express";
import { ExpressMethodAnalyseService } from "./methodAnalyse.service";

@Service()
export class ExpressAnalyseService {
  @Autowired()
  private readonly methodAnalyseService: ExpressMethodAnalyseService;

  @Bean()
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
      // 分析方法
      this.methodAnalyseService.route(router, controller, propertyKey, instance);
    }
    return router;
  }

  @Bean()
  public analyse(mapper: INailyControllerRegistry[]): Router[] {
    // routers存放
    const results: Router[] = [];
    // 遍历controller们
    for (const controller of mapper) {
      // 分析controller 得到router
      const router = this.controllerAnalyse(controller);
      // 添加router到results数组中
      results.push(router);
    }
    return results;
  }
}
