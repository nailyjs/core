import { ScopeEnum } from "../constants";

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

declare global {
  export namespace Naily {
    export namespace IOC {
      export interface BeanOptions {
        Scope: ScopeEnum;
        Rebind: boolean;
        Autoload: boolean;
      }
    }
  }
}
