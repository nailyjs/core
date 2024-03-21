import { n } from "@/schema/common.schema";
import { ImplNailyPlugin } from "@/typings";

export abstract class NailyGlobalContext {
  /**
   * @private
   * @privateApi This is private API and should not be used directly.
   */
  public static readonly _globalPlugins = new Set<ImplNailyPlugin | n.IType<ImplNailyPlugin>>();
}
