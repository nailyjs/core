// noinspection JSUnusedGlobalSymbols
export type NailyConstant = typeof NailyConstant;
export const NailyConstant = {
  Provide: Symbol("Provide"),
  Inject: Symbol("Inject"),
};

export enum ScopeEnum {
  Singleton = "Singleton",
  Request = "Request",
  Prototype = "Prototype",
}
