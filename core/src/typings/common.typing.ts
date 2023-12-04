import { NailyBeanFactory } from "../classes";
import { ScopeEnum } from "../constants";

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

declare global {
  export namespace NIOC {
    export interface BeanMetadata {
      Token: string | symbol;
      Scope: ScopeEnum;
    }

    export interface BeanElement<T = any> {
      target: Type<T>;
      instance: T | undefined;
    }
  }

  export namespace NAOP {
    export interface Advice {
      nailyBeforeExecute?<Instance extends Object>(target: Instance, factory: NailyBeanFactory<Instance>, args: any[]): void | Promise<void>;
      nailyAfterExecute?<Instance extends Object>(target: Instance, factory: NailyBeanFactory<Instance>, returnValue: any): void | Promise<void>;
    }
  }
}
