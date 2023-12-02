import { ScopeOptions } from "../constants";

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

declare global {
  export namespace NIOC {
    export namespace Metadata {
      export interface BaseBean {
        Token: string | symbol;
      }
      export interface ClassBean extends BaseBean {
        Scope: ScopeOptions;
        ReBind: boolean;
      }
      export interface PropertyBean extends BaseBean {
        Scope: ScopeOptions;
        ReBind: boolean;
      }
      export interface MethodBean extends BaseBean {
        Scope: ScopeOptions;
        ReBind: boolean;
      }
      export type Bean = ClassBean | PropertyBean | MethodBean;
    }

    export namespace Registry {
      export interface ClassElement<Instance extends Object = Object> {
        type: "class";
        target: Type<Instance>;
        instance: Instance;
      }
      export type Element = ClassElement;
    }
  }
}
