import { NailyBeanFactory } from "../classes/index.js";
import { ScopeEnum } from "../constants/index.js";
import Jexl from "jexl";

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

declare global {
  export namespace NIOC {
    export interface BeanMetadata {
      Token: string | symbol;
      Scope: ScopeEnum;
      ReBind: boolean;
    }

    export interface BeanElement<T = any> {
      target: Type<T>;
      instance: T | undefined;
    }

    export interface Configure {
      getConfigure(builder: typeof Jexl, isOptional: boolean): any;
    }
  }

  export namespace NAOP {
    export interface Advice {
      nailyBeforeExecute?<Instance extends Object>(target: Instance, factory: NailyBeanFactory<Instance>, args: any[]): void | Promise<void>;
      nailyAfterExecute?<Instance extends Object>(target: Instance, factory: NailyBeanFactory<Instance>, returnValue: any): void | Promise<void>;
      nailyAfterThrowing?<Instance extends Object>(target: Instance, factory: NailyBeanFactory<Instance>, error: Error): void | Promise<void>;
    }
  }
}
