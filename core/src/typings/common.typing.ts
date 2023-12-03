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
}
