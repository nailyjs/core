import { NailyContainer } from "../containers";

export interface IType<T = any> extends Function {
  new (...args: any[]): T;
}

export interface ImplInitializePlugin {
  beforeCreateInstance?(target: IType, params: any[], container: typeof NailyContainer): void;
  afterCreateInstance?(target: IType, instance: any, container: typeof NailyContainer): void;
}
