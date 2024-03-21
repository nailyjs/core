import { n } from "@/schema/common.schema";
import { ImplNailyPlugin } from "@/typings";
import { NailyGlobalContext } from "./global.ctx";

export abstract class AbstractNailyBootstrap {
  public useGlobalNailyPlugin(plugin: ImplNailyPlugin | n.IType<ImplNailyPlugin>): this {
    NailyGlobalContext._globalPlugins.add(plugin);
    return this;
  }

  public abstract run(): Promise<unknown>;
}
