import { IType } from "./common.typing";

export type IToken = string | symbol | IType | Function;
export type IContainerConstant = string | number | object;

export interface IContainerConstantValue<T = any> {
  value: T | IContainerConstant;
}
export interface IContainerClassValue<T = any> {
  target: IType<T>;
  instance?: T;
}
export type IContainerValue<T = any> = IContainerConstantValue<T> | IContainerClassValue<T>;
