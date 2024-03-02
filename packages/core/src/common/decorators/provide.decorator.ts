import "reflect-metadata";
import { NailyContainerConstant, ScopeEnum } from "../constants";
import { IInjectableOptionsOptional, InjectableOptionsOptionalSchema, n } from "../schemas";
import { IType } from "../typings";
import { NailyContainer, NailyContainerUtil } from "../containers";

export type InjectableDecorator = (target: IType) => void;
/**
 * ### Provide
 *
 * The `@Provide` decorator is used to define a class as a service provider.
 *
 * @export
 * @param {IInjectableOptionsOptional} [injectableOptions = {}] - Injectable options
 * @return {InjectableDecorator}
 */
export function Provide(injectableOptions: IInjectableOptionsOptional = {}): InjectableDecorator {
  return (target: IType) => {
    if (n.isEmpty(injectableOptions)) injectableOptions = {};
    if (n.isEmpty(injectableOptions.token)) injectableOptions.token = target;
    if (n.isEmpty(injectableOptions.scope)) injectableOptions.scope = ScopeEnum.BeforeBoot;
    if (n.isEmpty(injectableOptions.singleton)) injectableOptions.singleton = true;
    if (n.isEmpty(injectableOptions.initializeParams)) injectableOptions.initializeParams = [];

    if (injectableOptions.scope === ScopeEnum.Autoload) {
      const classValue = NailyContainer.safeGetTarget(injectableOptions.token);
      if (!classValue) NailyContainer.addTarget(injectableOptions.token, target);
      const instance = NailyContainer.initializeExistingTarget(
        injectableOptions.token,
        NailyContainerUtil.transformParameters(target, injectableOptions.initializeParams),
        true,
      );
      target.prototype = instance;
    }

    const parsedOptions = InjectableOptionsOptionalSchema.parse(injectableOptions);
    Reflect.defineMetadata(NailyContainerConstant.INJECTABLE, parsedOptions, target);
  };
}
