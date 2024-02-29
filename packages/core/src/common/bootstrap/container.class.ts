import { IToken, ImplNailyPlugin, Type } from "../typings";

export interface INailyContainerMapValue {
  target: Type;
  instance?: any;
}

interface IPreDefineInjectables {
  token: IToken;
  target: Type;
}

export class NailyContainer {
  /**
   * ### Container
   *
   * Naily Container to store all injectable classes.
   *
   * @private
   * @memberof NailyContainer
   */
  private readonly container = new Map<IToken, INailyContainerMapValue>();
  /**
   * ### Pre-Define Injectables
   *
   * Pre-define injectables for Naily Container. It will be added to the container when a class use `@Injectable` decorator.
   *
   * @static
   * @type {IPreDefineInjectables[]}
   * @memberof NailyContainer
   */
  public static readonly preDefineInjectables: IPreDefineInjectables[] = [];

  constructor(private readonly plugins: ImplNailyPlugin[]) {
    NailyContainer.preDefineInjectables.forEach((injectable) => {
      let v: INailyContainerMapValue = { target: injectable.target };
      for (const plugin of this.plugins) {
        if (plugin.preDefineCreateInjectable) {
          v = plugin.preDefineCreateInjectable(injectable.target, this, plugins);
          if (!v)
            throw new TypeError(`Class ${injectable.target.name} is not injectable, please use @Injectable() decorator`, {
              cause: `Plugin error: ${plugin.constructor.name} preDefineCreateInjectable return undefined or null`,
            });
        }
      }
      this.add(injectable.token, v);
    });
  }

  /**
   * ### Add
   *
   * Add a new injectable class to Naily Container.
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/02/26
   * @param {IToken} token
   * @param {INailyContainerMapValue} v
   * @memberof NailyContainer
   */
  public add(token: IToken, v: INailyContainerMapValue) {
    this.container.set(token, v);
  }

  /**
   * ### Set Instance
   *
   * Set instance to a injectable class.
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/02/26
   * @param {IToken} token
   * @param {*} instance
   * @memberof NailyContainer
   */
  public setInstance(token: IToken, instance: any) {
    const value = this.container.get(token);
    if (value) {
      value.instance = instance;
      this.container.set(token, value);
    }
  }

  /**
   * ### Get
   *
   * Get a injectable class from Naily Container.
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/02/26
   * @param {IToken} token
   * @return {INailyContainerMapValue}
   * @memberof NailyContainer
   */
  public get(token: IToken): INailyContainerMapValue {
    return this.container.get(token);
  }

  /**
   * ### Get All
   *
   * Get container map.
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/02/26
   * @memberof NailyContainer
   */
  public getAll(): Map<IToken, INailyContainerMapValue> {
    return this.container;
  }

  /**
   * ### Clear
   *
   * Clear Naily Container.
   *
   * @memberof NailyContainer
   */
  public clear() {
    this.container.clear();
  }

  /**
   * ### Remove
   *
   * Remove a injectable class by token from Naily Container.
   *
   * @param {IToken} token
   * @memberof NailyContainer
   */
  public remove(token: IToken) {
    this.container.delete(token);
  }
}
