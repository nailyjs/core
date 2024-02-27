import { NailyContainerConstant } from "../../common/constants";
import { ImplNailyJexlPlugin, ImplNailyPlugin, Type } from "../../common/typings";
import { IValueMetadata } from "../../common/typings/metadata.typing";
import { Jexl } from "jexl";
import { NailyValueUtil } from "../../common/providers/value.service";

export class InjectValuePlugin implements ImplNailyPlugin {
  public static readonly jexl = new Jexl();
  public loadedYaml = NailyValueUtil.getConfigurationCache();

  constructor(jexlPlugins: ImplNailyJexlPlugin[] = []) {
    this.loadedYaml = NailyValueUtil.getConfiguration();
    for (const plugin of jexlPlugins) {
      plugin.buildJexl(InjectValuePlugin.jexl);
    }
  }

  afterCreateInjectable<T>(target: Type<T>, instance: T): Object {
    const valueKeys: IValueMetadata[] = Reflect.getMetadata(NailyContainerConstant.VALUEKEY, target) || [];
    for (const key of valueKeys) {
      const value: IValueMetadata = Reflect.getMetadata(NailyContainerConstant.VALUE, target.prototype, key.propertyKey);
      if (!value) continue;
      const jexlValue = value.jexl;
      instance[key.propertyKey] = InjectValuePlugin.jexl.evalSync(jexlValue, {
        ...(this.loadedYaml || {}),
        env: process.env || {},
      });
    }
    return instance;
  }
}
