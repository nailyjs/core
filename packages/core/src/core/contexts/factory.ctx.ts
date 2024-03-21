import { n } from "@/schema/common.schema";
import { NailyContext } from "./naily.ctx";
import { ImplNailyPlugin } from "@/typings";
import { NailyGlobalContext } from "./global.ctx";
import isClass from "is-class";
import { IProvideOptions, IProvideOptionsSchema } from "../decorators";
import { ClassDecoratorContext } from "../build";
import { NailyConstant, ScopeEnum } from "@/constant";

export class NailyClassFactory<Instance> {
  constructor(
    private target: n.IType<Instance>,
    private readonly currentContext: NailyContext,
    private readonly extraPlugins: (ImplNailyPlugin | n.IType<ImplNailyPlugin>)[] = [],
  ) {}

  private async _applyGlobalAndContextPlugins(): Promise<ImplNailyPlugin[]> {
    const pluginInstances: ImplNailyPlugin[] = [];
    for (const plugin of [...this.extraPlugins, ...NailyGlobalContext._globalPlugins].filter(item => item !== this.target)) {
      if (isClass(plugin)) {
        const pluginInstance = await new NailyClassFactory(plugin, this.currentContext).getInstance();
        pluginInstances.push(pluginInstance);
      } else pluginInstances.push(plugin);
    }
    return pluginInstances;
  }

  public getProvideOptions() {
    const value = new ClassDecoratorContext(this.target).getMetadata<IProvideOptions | undefined>(NailyConstant.Provide);
    return IProvideOptionsSchema(this.target).safeParse(value);
  }

  public async createInstance(): Promise<Instance> {
    const provideOptions = this.getProvideOptions();
    if (provideOptions.success === false) throw provideOptions.error;

    let params: unknown[] = [];
    const plugins = await this._applyGlobalAndContextPlugins();
    for (const plugin of plugins) {
      if (plugin.beforeCreateInstance && typeof plugin.beforeCreateInstance === "function") {
        await plugin.beforeCreateInstance({
          getNailyContext: () => this.currentContext,
          getTarget: <Instance>() => this.target as Instance,
          setTarget: <Instance>(target: n.IType<Instance>) => ((this.target as Instance) = target as Instance),
          getArgs: () => params,
          setArgs: args => (params = args),
        });
      }
    }
    let instance = Reflect.construct(this.target, params);
    for (const plugin of plugins) {
      if (plugin.afterCreateInstance && typeof plugin.afterCreateInstance === "function") {
        await plugin.afterCreateInstance({
          getNailyContext: () => this.currentContext,
          getTarget: <Instance>() => this.target as Instance,
          setTarget: <Instance>(target: n.IType<Instance>) => ((this.target as Instance) = target as Instance),
          getArgs: () => params,
          getInstance: <Instance>() => instance as unknown as Instance,
          setInstance: newInstance => (instance = newInstance as unknown as Instance),
        });
      }
    }
    return instance;
  }

  public async getInstance() {
    const provideOptions = this.getProvideOptions();
    if (provideOptions.success === false) throw provideOptions.error;
    if (provideOptions.data.scope === ScopeEnum.Singleton) {
      if (this.currentContext) {
      }
    }

    const instance = await this.createInstance();
    return instance;
  }
}
