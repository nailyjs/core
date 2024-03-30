import { z } from "zod";
import { isClass } from "is-class";

export function type<Instance>() {
  return z.custom<IType<Instance>>((data) => isClass(data));
}
export interface IType<Instance = unknown> extends Function {
  new (...args: any[]): Instance;
}

export function token<Instance>() {
  return z.union([z.string(), z.symbol(), type<Instance>()]);
}
export type IToken<Instance = unknown> = z.infer<ReturnType<typeof token<Instance>>>;
