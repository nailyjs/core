import { INailyContainerMapValue, NailyContainer } from "../bootstrap/container.class";
import { InitFactory } from "../bootstrap/init.class";
import { ScopeEnum } from "../constants";
import { Jexl } from "jexl";

export interface ImplNailyService {
  /**
   * ### Naily Injectable Lifecycle onReady
   *
   * When all the child injectables are ready, the `onReady` method will be called.
   *
   * @return {(void | Promise<void>)}
   * @memberof ImplNailyService
   */
  onReady?(): void | Promise<void>;
}

export interface ImplNailyInterceptor {
  before?(...args: any[]): void | Promise<void>;
  after?(...args: any[]): void | Promise<void>;
  catch?(...args: any[]): void | Promise<void>;
  finally?(...args: any[]): void | Promise<void>;
}

export interface ImplNailyPlugin {
  preDefineCreateInjectable?<T>(target: Type<T>, container: NailyContainer, pluginsContext: ImplNailyPlugin[]): INailyContainerMapValue;
  beforeCreateInjectable?<T>(target: Type<T>, factory: InitFactory<T>, container: NailyContainer): void;
  afterCreateInjectable?<T>(target: Type<T>, instance: T, factory: InitFactory<T>, container: NailyContainer): Object;
}

export interface ImplNailyJexlPlugin {
  buildJexl?(jexlInstance: InstanceType<typeof Jexl>): void;
}

export interface INailyInterceptBeforeArgHost {
  getTarget(): Type;
  getInstance(): any;
  getArguments(): any[];
  getMethodKey(): string | symbol;
}

export interface INailyInterceptAfterArgHost extends INailyInterceptBeforeArgHost {
  getReturnValue(): any;
}

export interface INailyInterceptCatchArgHost extends INailyInterceptBeforeArgHost {
  getError(): any;
}

export interface ImplNailyInterceptPlugin {
  /**
   * ### Naily Intercept
   *
   * This method will be called before the method of the interceptor is called.
   *
   * @param {INailyInterceptBeforeArgHost} argHost
   * @return {(any[] | Promise<any[]>)}
   * @memberof ImplNailyInterceptPlugin
   */
  transformBefore?(argHost: INailyInterceptBeforeArgHost): any[] | Promise<any[]>;
  /**
   * ### Naily Intercept
   *
   * This method will be called after the method of the interceptor is called.
   *
   * @param {"after"} when
   * @param {INailyInterceptAfterArgHost} argHost
   * @return {(any[] | Promise<any[]>)}
   * @memberof ImplNailyInterceptPlugin
   */
  transformAfter?(argHost: INailyInterceptAfterArgHost): any[] | Promise<any[]>;
  /**
   * ### Naily Intercept
   *
   * This method will be called when the method of the interceptor throws an error.
   *
   * @param {"catch"} when
   * @param {INailyInterceptCatchArgHost} argHost
   * @return {(any[] | Promise<any[]>)}
   * @memberof ImplNailyInterceptPlugin
   */
  transformCatch?(argHost: INailyInterceptCatchArgHost): any[] | Promise<any[]>;
  /**
   * ### Naily Intercept
   *
   * This method will be called when the method of the interceptor is finished.
   *
   * @param {"finally"} when
   * @param {INailyInterceptBeforeArgHost} argHost
   * @return {(any[] | Promise<any[]>)}
   * @memberof ImplNailyInterceptPlugin
   */
  transformFinally?(argHost: INailyInterceptBeforeArgHost): any[] | Promise<any[]>;
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export interface NoArgType<T = any> extends Function {
  new (): T;
}

export type IToken = string | symbol | Type;

export interface IInjectableOptions {
  scope: ScopeEnum;
  token: IToken;
}

export interface IInjectMetadata {
  token: IToken;
  type: unknown;
}
