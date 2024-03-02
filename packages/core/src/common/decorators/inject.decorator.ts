import { NailyContainer, NailyContainerUtil } from "../containers";
import { NailyContainerConstant, ScopeEnum } from "../constants";
import { IToken, IType } from "../typings";
import { IInjectableOptions, InjectableOptionsSchema, n } from "../schemas";

function createInjectDecorator(token?: IToken): PropertyDecorator & ParameterDecorator {
  return (target: Object, key: string | symbol, index?: number) => {
    if (typeof index === "number") {
      if (token) {
        const existingTarget = NailyContainer.safeGetTarget(token);
        const existingTargetOptions: IInjectableOptions = InjectableOptionsSchema.parse(
          Reflect.getMetadata(NailyContainerConstant.INJECTABLE, existingTarget),
        );
        if (!existingTarget && existingTargetOptions.scope !== ScopeEnum.OnInject) {
          throw new Error(`The token ${String(token)} does not exist in the container, please check your ${target.constructor.name} class`);
        }
        if (!existingTarget && existingTargetOptions.scope === ScopeEnum.OnInject) {
          NailyContainer.addTarget(token, target.constructor as IType);
          const instance = NailyContainer.initializeExistingTarget(
            token,
            NailyContainerUtil.transformParameters(target.constructor as IType, []),
            false,
          );
          target.constructor.prototype = instance;
        }
        target[key] = existingTarget;
      }

      const metadata: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
      const metadataIndexOptions: IInjectableOptions = InjectableOptionsSchema.parse(
        Reflect.getMetadata(NailyContainerConstant.INJECTABLE, metadata[index]),
      );

      if (metadataIndexOptions.scope === ScopeEnum.OnInject && metadata[index] && n.class().parse(metadata[index])) {
        const injectDesignTypeTargetOptions: IInjectableOptions = Reflect.getMetadata(NailyContainerConstant.INJECTABLE, metadata[index]);
        if (NailyContainer.safeGetTarget(injectDesignTypeTargetOptions.token)) {
          NailyContainer.addTarget(injectDesignTypeTargetOptions.token, metadata[index]);
        }
        const instance = NailyContainer.initializeExistingTarget(
          injectDesignTypeTargetOptions.token,
          NailyContainerUtil.transformParameters(metadata[index], injectDesignTypeTargetOptions.initializeParams),
          false,
        );
        metadata[index].prototype = instance;
        target[key] = instance;
      }
      Reflect.defineMetadata(NailyContainerConstant.INJECT, token, target, `${index}`);
    } else {
      const injectTyping: IType = Reflect.getMetadata("design:type", target, key);
      const metadata: IInjectableOptions = InjectableOptionsSchema.parse(Reflect.getMetadata(NailyContainerConstant.INJECTABLE, injectTyping));
      if (metadata.scope === ScopeEnum.OnInject && metadata && n.class().parse(injectTyping)) {
        if (NailyContainer.safeGetTarget(metadata.token)) {
          NailyContainer.addTarget(metadata.token, injectTyping);
        }
        const instance = NailyContainer.initializeExistingTarget(
          metadata.token,
          NailyContainerUtil.transformParameters(injectTyping, metadata.initializeParams),
          false,
        );
        injectTyping.prototype = instance;
        target[key] = instance;
      }
      Reflect.defineMetadata(NailyContainerConstant.INJECT, token, target, key);
    }
  };
}

/**
 * ### Inject
 *
 * The `@Inject` decorator is used to inject a token class or constant into a class.
 *
 * @export
 * @param {IToken} token - The token of the class or constant
 * @return {(PropertyDecorator & ParameterDecorator)}
 */
export function Inject(token: IToken): PropertyDecorator & ParameterDecorator {
  return createInjectDecorator(token);
}

/**
 * ### Autowired
 *
 * The `@Autowired` decorator will automatically get type information from the constructor and inject the class or constant into the class.
 *
 * @export
 * @return {(PropertyDecorator & ParameterDecorator)}
 */
export function Autowired(): PropertyDecorator & ParameterDecorator {
  return createInjectDecorator();
}
