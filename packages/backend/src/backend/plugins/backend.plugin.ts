import {
  IInjectableOptions,
  INailyContainerMapValue,
  ImplNailyPlugin,
  InitFactory,
  NailyContainer,
  NailyContainerConstant,
  Type,
} from "@nailyjs/core";
import { IAdapterType, INailyParameter, ImplNailyBackendFilter, ImplNailyBackendGuard, ImplNailyBackendPipe } from "../typings";
import { NailyBackendConstant } from "../constants";
import { AbstractNailyBackendAdapter, NailyBackendPluginContext } from "../class";
import { isClass } from "is-class";

export class NailyBackendPlugin extends NailyBackendPluginContext implements ImplNailyPlugin {
  constructor(
    private readonly adapter: AbstractNailyBackendAdapter,
    private readonly backendPipe: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[],
    private readonly backendGuard: (ImplNailyBackendGuard | Type<ImplNailyBackendGuard>)[],
    private readonly backendPlugin: NailyBackendPlugin[],
  ) {
    super();
  }

  public preDefineCreateInjectable<T>(target: Type<T>, container: NailyContainer, pluginsContext: ImplNailyPlugin[]): INailyContainerMapValue {
    // 注入后端插件
    for (const backendPlugin of this.backendPlugin) {
      const injectableMetadata: IInjectableOptions = Reflect.getMetadata(NailyContainerConstant.INJECTABLE, backendPlugin);
      if (!isClass(backendPlugin) || !injectableMetadata) continue;
      const pluginInstance = new InitFactory(backendPlugin, container, pluginsContext).getInstance();
      container.add(backendPlugin, {
        target: backendPlugin,
        instance: pluginInstance,
      });
    }
    // 初始化所有controller
    const router = Reflect.getMetadata(NailyBackendConstant.CONTROLLER, target);
    if (router) {
      return { target, instance: new InitFactory(target, container, pluginsContext).getInstance() };
    } else {
      return { target };
    }
  }

  public afterCreateInjectable<T>(target: Type<T>, instance: T, factory: InitFactory<T>, container: NailyContainer): T {
    return this.forEachInjectablePickController(target, instance, (classMapping, methodMapping, parameters, pipes, guards, filters, methodKey) => {
      this.adapter.handler({
        getContainer: () => container,
        getFactory: () => factory,
        getMethodMapping: () => methodMapping,
        getControllerMapping: () => classMapping,
        getMethodKey: () => methodKey,
        runMethod: async (adapterMetadata) => {
          try {
            // 是否需要返回
            let isResponse = false;
            // 执行全局管道
            for (const pipe of this.backendPipe) {
              await this.runUsePipe(
                adapterMetadata,
                // 如果是类则使用工厂创建实例 否则直接使用
                isClass(pipe) ? (new InitFactory(pipe as any, container).getInstance() as ImplNailyBackendPipe) : pipe,
              );
            }
            // 执行方法管道
            for (const pipe of pipes) {
              await this.runUsePipe(
                adapterMetadata,
                // 如果是类则使用工厂创建实例 否则直接使用
                isClass(pipe) ? (new InitFactory(pipe as any, container).getInstance() as ImplNailyBackendPipe) : pipe,
              );
            }
            // 执行方法参数管道
            for (const param of parameters) {
              if (param.pipes && Array.isArray(param.pipes)) await this.runMethodParameterPipe(adapterMetadata, parameters, container);
            }
            // 执行全局守卫
            for (const guard of this.backendGuard) {
              await this.runUseGuard(
                adapterMetadata,
                // 如果是类则使用工厂创建实例 否则直接使用
                isClass(guard) ? (new InitFactory(guard as any, container).getInstance() as ImplNailyBackendGuard) : guard,
                target,
                instance,
                methodKey,
              );
            }
            // 执行方法守卫
            for (const guard of guards) {
              await this.runUseGuard(
                adapterMetadata,
                // 如果是类则使用工厂创建实例 否则直接使用
                isClass(guard) ? (new InitFactory(guard as any, container).getInstance() as ImplNailyBackendGuard) : guard,
                target,
                instance,
                methodKey,
              );
            }
            // 组装方法参数
            const result = await instance[methodKey](
              ...parameters.map((param) => {
                if (adapterMetadata.adapterType === IAdapterType.Separate) {
                  if (param.type === INailyParameter.Request) return adapterMetadata.request;
                  if (param.type === INailyParameter.Response) {
                    isResponse = true;
                    return adapterMetadata.response;
                  }
                } else if (adapterMetadata.adapterType === IAdapterType.Context) {
                  if (param.type === INailyParameter.Context) {
                    isResponse = true;
                    return adapterMetadata.context;
                  }
                }
                if (param.type === INailyParameter.Params) return adapterMetadata.params;
                if (param.type === INailyParameter.Query) return adapterMetadata.query;
                if (param.type === INailyParameter.Body) return adapterMetadata.body;
                if (param.type === INailyParameter.Headers) return adapterMetadata.headers;
                if (param.type === INailyParameter.Ip) return adapterMetadata.ip;
                if (param.type === INailyParameter.Ips) return adapterMetadata.ips;
                if (param.type === INailyParameter.Next) return adapterMetadata.next;
                return undefined;
              }),
            );
            // 返回结果
            return { result, isResponse };
          } catch (error) {
            // 错误处理
            for (const filter of filters) {
              await this.runUseFilter(
                adapterMetadata,
                isClass(filter) ? (new InitFactory(filter as any, container).getInstance() as ImplNailyBackendFilter) : filter,
              );
            }
          }
        },
        getRawController: () => target,
        getRawInstance: () => instance,
      });
    });
  }
}
