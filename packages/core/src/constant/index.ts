// noinspection JSUnusedGlobalSymbols
export type NailyConstant = typeof NailyConstant;
export const NailyConstant = {
  Provide: Symbol("Provide"),
  Inject: Symbol("Inject"),
  Configuration: Symbol("Configuration"),
};

export enum ScopeEnum {
  Singleton = "Singleton",
  Request = "Request",
  Prototype = "Prototype",
}
