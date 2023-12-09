export const enum ScopeEnum {
  /**
   * * Default scope
   *
   * * When called, the same instance will be returned.
   *
   * * When `autowired`, the instance won't be initialized.
   *
   * @default
   */
  SINGLETON = "SINGLETON",
  /**
   * * When called, a new instance will be returned.
   *
   * * When `autowired`, the instance won't be initialized.
   */
  TRANSIENT = "TRANSIENT",
  /**
   * * When called, a new instance will be returned.
   *
   * * When `autowired`, the instance will be initialized.
   */
  PROTOTYPE = "PROTOTYPE",
}

export const enum NailyWatermark {
  BEAN = "__naily:bean__",
  INJECT = "__naily:inject__",
  ADVICE = "__naily:advice__",
}
