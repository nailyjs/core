import { isClass } from "is-class";
import { z } from "zod";

export namespace n {
  export function token<Instance>() {
    return z.union([z.string(), z.symbol(), type<Instance>()]);
  }
  export type IToken<Instance = unknown> = z.infer<ReturnType<typeof token<Instance>>>;

  export function type<Instance>() {
    return z.custom<IType<Instance>>((data) => isClass(data));
  }
  export interface IType<Instance = unknown> extends Function {
    new (...args: any[]): Instance;
  }
}
