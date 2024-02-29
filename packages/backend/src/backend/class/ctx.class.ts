import { InitFactory, NailyContainer, Type } from "@nailyjs/core";
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
import isClass from "is-class";
import { NailyBackendConstant } from "../constants";

/**
 * ### Naily backend plugin context
 *
 * The naily backend plugin context. It is used to run the backend pipes, guards, and filters.
 *
 * @export
 * @abstract
 * @class NailyBackendPluginContext
 */
export abstract class NailyBackendPluginContext {
  protected async runUsePipe(adapterMetadata: IAdapterRequestHandlerGetMethodCallback, pipe: ImplNailyBackendPipe) {
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

  protected async runMethodParameterPipe(
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

  protected async runUseGuard(
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

  protected async runUseFilter(adapterMetadata: IAdapterRequestHandlerGetMethodCallback, filter: ImplNailyBackendFilter) {
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

  /**
   * ### ForEach injectable to pick controller
   *
   * @protected
   * @template Instance - The class instance type.
   * @param {Type<Instance>} target - The class target type.
   * @param {Instance} instance - The class instance.
   * @param {NailyBackendPluginContextForEachCallback} cb - The callback.
   * @return {Instance} - Return the class instance.
   * @memberof NailyBackendPluginContext
   */
  protected forEachInjectablePickController<Instance>(
    target: Type<Instance>,
    instance: Instance,
    cb: NailyBackendPluginContextForEachCallback,
  ): Instance {
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
        cb(controller, mapping, parameters, pipes, guards, filters, methodKey);
      }
    }
    return instance;
  }
}

type NailyBackendPluginContextForEachCallback = (
  classMapping: INailyControllerMetadata,
  classMethodMapping: INailyControllerMapping,
  classMethodParameters: INailyParameterMetadata[],
  classMethodPipes: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[],
  classMethodGuards: (ImplNailyBackendGuard | Type<ImplNailyBackendGuard>)[],
  classMethodFilters: (ImplNailyBackendFilter | Type<ImplNailyBackendFilter>)[],
  classMethodKey: string | symbol,
) => void;
