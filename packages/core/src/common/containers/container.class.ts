import { NailyContainerSchema, n } from "../schemas";
import { IToken, IContainerValue, IType, IContainerClassValue, IContainerConstantValue, ImplInitializePlugin } from "../typings";

export class NailyContainer {
  private static readonly container = new Map<IToken, IContainerValue>();
  private static readonly initializePlugins: ImplInitializePlugin[] = [];

  /**
   * ### add Target
   *
   * Adds a target class to the container
   *
   * @template T - The type of the target
   * @param {IToken} token - The token to be added
   * @param {IType<T>} target - The target to be added
   * @memberof NailyContainer
   */
  public static addTarget<T>(token: IToken, target: IType<T>): void;
  public static addTarget(...args: any[]): void {
    const parameters = NailyContainerSchema.addTargetSchema().parameters().parse(args);
    const [token, target] = parameters;
    if (this.container.has(token)) throw new Error(`The token ${String(token)} already exists in the container`);
    this.container.set(token, { target });
    return;
  }

  /**
   * ### Get Target
   *
   * Gets a target class from the container by its token.
   *
   * @static
   * @template T - The type of the target
   * @param {IToken} token - The token of the target to get
   * @return {IContainerClassValue<T>} - The target from the container
   * @memberof NailyContainer
   */
  public static getTarget<T>(token: IToken): IContainerClassValue<T>;
  public static getTarget(...args: any[]) {
    const parameters = NailyContainerSchema.getTargetSchema().parameters().parse(args);
    const [token] = parameters;
    if (!this.container.has(token)) throw new Error(`The token ${String(token)} does not exist in the container`);
    const value = this.container.get(token);
    return NailyContainerSchema.getTargetSchema().returnType().parse(value);
  }

  /**
   * ### Safe Get Target
   *
   * Gets a target class from the container by its token, if the target does not exist, returns `undefined`.
   *
   * @static
   * @template T - The type of the target
   * @param {IToken} token - The token of the target to get
   * @return {(IContainerClassValue<T> | undefined)} - The target from the container or `undefined`
   * @memberof NailyContainer
   */
  public static safeGetTarget<T>(token: IToken): IContainerClassValue<T> | undefined;
  public static safeGetTarget(...args: any[]) {
    const parameters = NailyContainerSchema.getTargetSchema().parameters().parse(args);
    const [token] = parameters;
    if (!this.container.has(token)) return undefined;
    const value = this.container.get(token);
    return NailyContainerSchema.getTargetSchema().returnType().parse(value);
  }

  /**
   * ### Initialize Target
   *
   * Initialize a `existing` target instance with the given parameters and returns the instance.
   *
   * @static
   * @template Instance
   * @param {IToken} token - The token of the target
   * @param {any[]} params - The parameters to be passed to the target
   * @param {boolean} force - Force the initialization of the target, Default is `false`. If `true`, the target will be initialized even if it already exists a instance.
   * @return {Instance}
   * @memberof NailyContainer
   */
  public static initializeExistingTarget<Instance>(token: IToken, params: any[], force?: boolean): Instance;
  public static initializeExistingTarget(...args: any[]): any {
    const parameters = NailyContainerSchema.initializeExistingTargetSchema().parameters().parse(args);
    const [token, params, force] = parameters;
    if (this.container.has(token)) {
      const value = this.getTarget(token);
      const parsedValue = NailyContainerSchema.containerClassValue().parse(value);
      if (parsedValue.instance && typeof parsedValue.instance === "object" && force === false) {
        return parsedValue.instance;
      }
      for (const initializePlugin of this.initializePlugins) {
        if (initializePlugin.beforeCreateInstance) {
          initializePlugin.beforeCreateInstance(parsedValue.target, params, this);
        }
      }
      const instance = new parsedValue.target(...params);
      this.container.set(token, {
        target: parsedValue.target,
        instance,
      });
      for (const initializePlugin of this.initializePlugins) {
        if (initializePlugin.afterCreateInstance) {
          initializePlugin.afterCreateInstance(parsedValue.target, instance, this);
        }
      }
      return instance;
    }
  }

  /**
   * ### Remove Target
   *
   * Removes a target class from the container.
   *
   * @static
   * @param {IToken} token - The token of the target to be removed
   * @memberof NailyContainer
   */
  public static removeTargetByToken(token: IToken): void;
  public static removeTargetByToken(...args: any[]): void {
    const parameters = NailyContainerSchema.removeTargetByTokenSchema().parameters().parse(args);
    const [token] = parameters;
    if (!this.container.has(token)) throw new Error(`The token ${String(token)} does not exist in the container`);
    this.container.delete(token);
    return;
  }

  /**
   * ### Add Constant
   *
   * Adds a constant value to the container.
   *
   * @static
   * @template T - The type of the constant
   * @param {IToken} token - The token to be added
   * @param {T} constant - The constant to be added
   * @memberof NailyContainer
   */
  public static addConstant<T>(token: IToken, constant: T): void;
  public static addConstant(...args: any[]): void {
    const parameters = NailyContainerSchema.addConstantOrUpdateConstantSchema().parameters().parse(args);
    const [token, constant] = parameters;
    if (this.container.has(token)) throw new Error(`The token ${String(token)} already exists in the container`);
    this.container.set(token, {
      value: n.constantValue().parse(constant),
    });
    return;
  }

  /**
   * ### Get Constant
   *
   * Gets a constant value from the container by its token.
   *
   * @static
   * @template T - The type of the constant
   * @param {IToken} token - The token of the constant to get
   * @return {IContainerConstantValue<T>} - The constant from the container
   * @memberof NailyContainer
   */
  public static getConstant<T>(token: IToken): IContainerConstantValue<T>;
  public static getConstant(...args: any[]) {
    const parameters = NailyContainerSchema.getTargetSchema().parameters().parse(args);
    const [token] = parameters;
    if (!this.container.has(token)) throw new Error(`The token ${String(token)} does not exist in the container`);
    const value = this.container.get(token);
    return NailyContainerSchema.containerConstantValue().parse(value);
  }

  /**
   * ### Update Constant
   *
   * Updates a constant value in the container.
   *
   * @static
   * @template T - The type of the constant
   * @param {IToken} token - The token to be updated
   * @param {T} constant - The constant to be updated
   * @memberof NailyContainer
   */
  public static updateConstant<T>(token: IToken, constant: T): void;
  public static updateConstant(...args: any[]): void {
    const parameters = NailyContainerSchema.addConstantOrUpdateConstantSchema().parameters().parse(args);
    const [token, constant] = parameters;
    if (!this.container.has(token)) throw new Error(`The token ${String(token)} does not exist in the container`);
    this.container.set(token, {
      value: n.constantValue().parse(constant),
    });
    return;
  }

  /**
   * ### Remove Constant
   *
   * Removes a constant value from the container.
   *
   * @static
   * @param {IToken} token - The token of the constant to be removed
   * @memberof NailyContainer
   */
  public static removeConstantByToken(token: IToken): void;
  public static removeConstantByToken(...args: any[]): void {
    const parameters = NailyContainerSchema.removeTargetByTokenSchema().parameters().parse(args);
    const [token] = parameters;
    if (!this.container.has(token)) throw new Error(`The token ${String(token)} does not exist in the container`);
    this.container.delete(token);
    return;
  }

  /**
   * ### Clear
   *
   * Clears the container.
   *
   * @static
   * @memberof NailyContainer
   */
  public static clear(): void {
    this.container.clear();
    return;
  }
}
