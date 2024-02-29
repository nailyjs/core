export const NailyContainerConstant = {
  INJECTABLE: Symbol("__injectable__"),
  INJECT: Symbol("__inject__"),
  INJECTKEY: Symbol("__injectkey__"),

  INTERCEPT: Symbol("__intercept__"),
  INTERCEPT_PARAMETER: Symbol("__intercept_parameter__"),
  VALUE: Symbol("__value__"),
  VALUEKEY: Symbol("__valuekey__"),
};

export const enum ScopeEnum {
  Singleton = "Singleton", // 单例 一个容器只有一个实例 默认
  Transient = "Transient", // 瞬时 一个容器每次使用都会创建一个新的实例
}
