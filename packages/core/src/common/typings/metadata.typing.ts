import { IInjectMetadata, IInjectableOptions } from "./common.typing";

export interface IInjectClassMetadata {
  [key: string | symbol]: IInjectMetadata;
}

export interface IInjectableClassMetadata {
  options: Partial<IInjectableOptions>;
  paramTypes: any[];
}
