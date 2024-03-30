import { IType, IToken } from "@/common/schemas";
import { ScopeEnum } from "@/common/constants";

export namespace IElement {
  export interface IClassElement<Instance = unknown> {
    kind: "class";
    scope: ScopeEnum;
    target: IType<Instance>;
    instance?: Instance;
    tokens: IToken[];
  }
  export interface IConstantElement<Value = unknown> {
    kind: "constant";
    value: Value;
    target: undefined | IType;
    tokens: IToken[];
  }
}
export type IElement<I = unknown> = IElement.IClassElement<I> | IElement.IConstantElement<I>;
