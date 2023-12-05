import { Type } from "@nailyjs/core";

export function Param(...pipes: Type[]): ParameterDecorator;
export function Param(id: string, ...pipes: Type[]): ParameterDecorator;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Param(id: string | Type, ...pipes: Type[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (target: Object, propertyKey: string | symbol, index: number) => {};
}
