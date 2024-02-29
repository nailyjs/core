import { INailyContainerMapValue, ImplNailyPlugin, InitFactory, NailyContainer, Type } from "@nailyjs/core";
import {
  IAdapterRequestHandlerGetMethodCallback,
  IAdapterType,
  INailyControllerMapping,
  INailyControllerMetadata,
  INailyParameter,
  INailyParameterMetadata,
  ImplNailyBackendFilter,
  ImplNailyBackendGuard,
  ImplNailyBackendPipe,
} from "../typings";
import { NailyBackendConstant } from "../constants";
import { AbstractNailyBackendAdapter } from "../class/adapter.class";
import { isClass } from "is-class";

export class NailyBackendPlugin implements ImplNailyPlugin {
  constructor(
    private readonly adapter: AbstractNailyBackendAdapter,
    private readonly backendPipe: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[],
    private readonly backendGuard: (ImplNailyBackendGuard | Type<ImplNailyBackendGuard>)[],
  ) {}

  public preDefineCreateInjectable<T>(target: Type<T>, container: NailyContainer, pluginsContext: ImplNailyPlugin[]): INailyContainerMapValue {
    const router = Reflect.getMetadata(NailyBackendConstant.CONTROLLER, target);
    if (router) {
      return { target, instance: new InitFactory(target, container, pluginsContext).getInstance() };
    } else {
      return { target };
    }
  }

  private async runUsePipe(adapterMetadata: IAdapterRequestHandlerGetMethodCallback, pipe: ImplNailyBackendPipe) {
    if (pipe.transform && adapterMetadata.adapterType === IAdapterType.Separate) {
      adapterMetadata.params = await pipe.transform(adapterMetadata.params, {
        getResponse: () => adapterMetadata.response,
        getRequest: () => adapterMetadata.request,
        getContext: () => undefined,
        getAdapterType: () => adapterMetadata.adapterType,
        getParamType: () => "params",
        getParamDesignType: () => undefined,
      });
      adapterMetadata.query = await pipe.transform(adapterMetadata.query, {
        getResponse: () => adapterMetadata.response,
        getRequest: () => adapterMetadata.request,
        getContext: () => undefined,
        getAdapterType: () => adapterMetadata.adapterType,
        getParamType: () => "query",
        getParamDesignType: () => undefined,
      });
      adapterMetadata.body = await pipe.transform(adapterMetadata.body, {
        getResponse: () => adapterMetadata.response,
        getRequest: () => adapterMetadata.request,
        getContext: () => undefined,
        getAdapterType: () => adapterMetadata.adapterType,
        getParamType: () => "body",
        getParamDesignType: () => undefined,
      });
    } else if (pipe.transform && adapterMetadata.adapterType === IAdapterType.Context) {
      adapterMetadata.params = await pipe.transform(adapterMetadata.params, {
        getResponse: () => undefined,
        getRequest: () => undefined,
        getContext: () => adapterMetadata.context,
        getAdapterType: () => adapterMetadata.adapterType,
        getParamType: () => "params",
        getParamDesignType: () => undefined,
      });
      adapterMetadata.query = await pipe.transform(adapterMetadata.query, {
        getResponse: () => undefined,
        getRequest: () => undefined,
        getContext: () => adapterMetadata.context,
        getAdapterType: () => adapterMetadata.adapterType,
        getParamType: () => "query",
        getParamDesignType: () => undefined,
      });
      adapterMetadata.body = await pipe.transform(adapterMetadata.body, {
        getResponse: () => undefined,
        getRequest: () => undefined,
        getContext: () => adapterMetadata.context,
        getAdapterType: () => adapterMetadata.adapterType,
        getParamType: () => "body",
        getParamDesignType: () => undefined,
      });
    }
  }

  private async runMethodParameterPipe(
    adapterMetadata: IAdapterRequestHandlerGetMethodCallback,
    parameters: INailyParameterMetadata[],
    container: NailyContainer,
  ) {
    for (const param of parameters) {
      if (param.type === INailyParameter.Params) {
        for (const pipe of param.pipes) {
          if (isClass(pipe) && adapterMetadata.adapterType === IAdapterType.Separate) {
            adapterMetadata.params = await (new InitFactory(pipe as any, container).getInstance() as ImplNailyBackendPipe).transform(
              adapterMetadata.params,
              {
                getResponse: () => adapterMetadata.response,
                getRequest: () => adapterMetadata.request,
                getContext: () => undefined,
                getAdapterType: () => adapterMetadata.adapterType,
                getParamType: () => "params",
                getParamDesignType: () => param.designType,
              },
            );
          } else if (isClass(pipe) && adapterMetadata.adapterType === IAdapterType.Context) {
            adapterMetadata.params = await (new InitFactory(pipe as any, container).getInstance() as ImplNailyBackendPipe).transform(
              adapterMetadata.params,
              {
                getResponse: () => undefined,
                getRequest: () => undefined,
                getContext: () => adapterMetadata.context,
                getAdapterType: () => adapterMetadata.adapterType,
                getParamType: () => "params",
                getParamDesignType: () => param.designType,
              },
            );
          }
        }
      }

      if (param.type === INailyParameter.Query) {
        for (const pipe of param.pipes) {
          if (isClass(pipe) && adapterMetadata.adapterType === IAdapterType.Separate) {
            adapterMetadata.query = await (new InitFactory(pipe as any, container).getInstance() as ImplNailyBackendPipe).transform(
              adapterMetadata.params,
              {
                getResponse: () => adapterMetadata.response,
                getRequest: () => adapterMetadata.request,
                getContext: () => undefined,
                getAdapterType: () => adapterMetadata.adapterType,
                getParamType: () => "query",
                getParamDesignType: () => param.designType,
              },
            );
          } else if (isClass(pipe) && adapterMetadata.adapterType === IAdapterType.Context) {
            adapterMetadata.query = await (new InitFactory(pipe as any, container).getInstance() as ImplNailyBackendPipe).transform(
              adapterMetadata.params,
              {
                getResponse: () => undefined,
                getRequest: () => undefined,
                getContext: () => adapterMetadata.context,
                getAdapterType: () => adapterMetadata.adapterType,
                getParamType: () => "query",
                getParamDesignType: () => param.designType,
              },
            );
          }
        }
      }

      if (param.type === INailyParameter.Body) {
        for (const pipe of param.pipes) {
          if (isClass(pipe) && adapterMetadata.adapterType === IAdapterType.Separate) {
            adapterMetadata.body = await (new InitFactory(pipe as any, container).getInstance() as ImplNailyBackendPipe).transform(
              adapterMetadata.params,
              {
                getResponse: () => adapterMetadata.response,
                getRequest: () => adapterMetadata.request,
                getContext: () => undefined,
                getAdapterType: () => adapterMetadata.adapterType,
                getParamType: () => "body",
                getParamDesignType: () => param.designType,
              },
            );
          } else if (isClass(pipe) && adapterMetadata.adapterType === IAdapterType.Context) {
            adapterMetadata.body = await (new InitFactory(pipe as any, container).getInstance() as ImplNailyBackendPipe).transform(
              adapterMetadata.params,
              {
                getResponse: () => undefined,
                getRequest: () => undefined,
                getContext: () => adapterMetadata.context,
                getAdapterType: () => adapterMetadata.adapterType,
                getParamType: () => "body",
                getParamDesignType: () => param.designType,
              },
            );
          }
        }
      }
    }
  }

  public async runUseGuard(
    adapterMetadata: IAdapterRequestHandlerGetMethodCallback,
    guard: ImplNailyBackendGuard,
    target: Type,
    instance: any,
    methodKey: string | symbol,
  ) {
    if (adapterMetadata.adapterType === IAdapterType.Separate) {
      await guard.defend({
        getResponse: () => adapterMetadata.response,
        getRequest: () => adapterMetadata.request,
        getContext: () => undefined,
        getAdapterType: () => adapterMetadata.adapterType,
        getTarget: () => target,
        getInstance: () => instance,
        getMethodKey: () => methodKey,
      });
    } else if (adapterMetadata.adapterType === IAdapterType.Context) {
      await guard.defend({
        getResponse: () => undefined,
        getRequest: () => undefined,
        getContext: () => adapterMetadata.context,
        getAdapterType: () => adapterMetadata.adapterType,
        getTarget: () => target,
        getInstance: () => instance,
        getMethodKey: () => methodKey,
      });
    }
  }

  private async runUseFilter(adapterMetadata: IAdapterRequestHandlerGetMethodCallback, filter: ImplNailyBackendFilter) {
    if (adapterMetadata.adapterType === IAdapterType.Separate) {
      await filter.catch(adapterMetadata.response, {
        getAdapterType: () => adapterMetadata.adapterType,
        getResponse: () => adapterMetadata.response,
        getRequest: () => adapterMetadata.request,
        getContext: () => undefined,
      });
    } else if (adapterMetadata.adapterType === IAdapterType.Context) {
      await filter.catch(undefined, {
        getAdapterType: () => adapterMetadata.adapterType,
        getResponse: () => undefined,
        getRequest: () => undefined,
        getContext: () => adapterMetadata.context,
      });
    }
  }

  public afterCreateInjectable<T>(target: Type<T>, instance: T, factory: InitFactory<T>, container: NailyContainer): T {
    const controller: INailyControllerMetadata = Reflect.getMetadata(NailyBackendConstant.CONTROLLER, target);
    if (!controller || !controller.path) return instance;
    const methodKeys = Reflect.ownKeys(target.prototype).filter((key) => key !== "constructor");

    for (const methodKey of methodKeys) {
      const mappings: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target.prototype, methodKey);
      const parameters: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target.prototype, methodKey) || [];
      const pipes: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[] =
        Reflect.getMetadata(NailyBackendConstant.PIPE, target.prototype, methodKey) || [];
      const guards: (ImplNailyBackendGuard | Type<ImplNailyBackendGuard>)[] =
        Reflect.getMetadata(NailyBackendConstant.GUARD, target.prototype, methodKey) || [];
      const filters: (ImplNailyBackendFilter | Type<ImplNailyBackendFilter>)[] =
        Reflect.getMetadata(NailyBackendConstant.FILTER, target.prototype, methodKey) || [];
      if (!mappings) continue;
      if (!Array.isArray(mappings)) continue;

      for (const mapping of mappings) {
        this.adapter.handler({
          getContainer: () => container,
          getFactory: () => factory,
          getMethodMapping: () => mapping,
          getControllerMapping: () => controller,
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
      }
    }
    return instance;
  }
}
