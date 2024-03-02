import { IInjectableOptions } from "../schemas";
import { NailyContainerConstant, ScopeEnum } from "../constants";
import { NailyContainer } from "../containers";
import { IType, ImplInitializePlugin } from "../typings";

export class InjectPropertyPlugin implements ImplInitializePlugin {
  afterCreateInstance(target: IType, instance: any, container: typeof NailyContainer): void {
    const properties: any[] = Reflect.ownKeys(target.prototype).filter((key) => key !== "constructor");

    for (const property of properties) {
      const metadata: IInjectableOptions = Reflect.getMetadata(NailyContainerConstant.INJECT, target.prototype, property);
      if (!metadata) continue;
      const existingTarget = container.safeGetTarget(metadata.token);
      if (!existingTarget && metadata.singleton) continue;
      if (!existingTarget && metadata.scope === ScopeEnum.AfterInject) {
        container.addTarget(metadata.token, target);
        const propertyInstance = container.initializeExistingTarget(metadata.token, [], false);
        target.prototype = propertyInstance;
        target.prototype[property] = propertyInstance;
        instance[property] = propertyInstance;
      }
    }
  }
}
