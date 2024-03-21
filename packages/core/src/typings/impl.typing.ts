import { NailyContext } from "@/core/contexts";
import { n } from "@/schema/common.schema";

export interface ImplNailyPlugin {
  /**
   * ### Before Create Instance hook
   *
   * This hook is called before the instance is created.
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/03/21
   * @param {ImplNailyPlugin.BeforeContext} ctx The context for the hook
   * @return {(void | Promise<void>)}
   * @memberof ImplNailyPlugin
   */
  beforeCreateInstance?(ctx: ImplNailyPlugin.BeforeContext): void | Promise<void>;
  /**
   * ### After Create Instance hook
   *
   * This hook is called after the instance is created.
   *
   * @param {ImplNailyPlugin.AfterContext} ctx The context for the hook
   * @return {(void | Promise<void>)}
   * @memberof ImplNailyPlugin
   */
  afterCreateInstance?(ctx: ImplNailyPlugin.AfterContext): void | Promise<void>;
}
export namespace ImplNailyPlugin {
  export interface Context {
    getNailyContext(): NailyContext;
    getTarget<Instance>(): n.IType<Instance>;
    setTarget<Instance>(target: n.IType<Instance>): void;
  }

  export interface BeforeContext extends Context {
    getArgs(): unknown[];
    setArgs<Args extends unknown[]>(args: Args): void;
  }

  export interface AfterContext extends Context {
    getArgs(): unknown[];
    getInstance<Instance>(): Instance;
    setInstance<Instance>(instance: Instance): void;
  }
}
