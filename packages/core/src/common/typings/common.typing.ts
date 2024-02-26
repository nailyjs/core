import { INailyContainerMapValue, NailyContainer } from "../bootstrap/container.class";
import { InitFactory } from "../bootstrap/init.class";
import { ScopeEnum } from "../constants";

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
  before?(...args: any[]): void;
  after?(...args: any[]): void;
  catch?(err: Error): void;
  finally?(): void;
}

export interface ImplNailyPlugin {
  preDefineCreateInjectable?<T>(target: Type<T>, container: NailyContainer): INailyContainerMapValue;
  beforeCreateInjectable?<T>(target: Type<T>, factory: InitFactory<T>, container: NailyContainer): void;
  afterCreateInjectable?<T>(target: Type<T>, instance: T, factory: InitFactory<T>, container: NailyContainer): Object;
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
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
