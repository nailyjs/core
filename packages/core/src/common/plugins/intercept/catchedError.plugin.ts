import { NailyContainerConstant } from "../..";
import { INailyInterceptCatchArgHost, ImplNailyInterceptPlugin } from "../../typings";
import { IInterceptParamMetadata, IInterceptParamMetadataType } from "../../typings/metadata.typing";

export class CatchedErrorPlugin implements ImplNailyInterceptPlugin {
  public transformCatch(argHost: INailyInterceptCatchArgHost) {
    const error = argHost.getError();
    const args = argHost.getArguments();
    const target = argHost.getTarget();
    const propertyKey = argHost.getMethodKey();
    const metadata: IInterceptParamMetadata[] = Reflect.getMetadata(NailyContainerConstant.INTERCEPT_PARAMETER, target, propertyKey) || [];
    for (const item in metadata) {
      if (metadata[item].type === IInterceptParamMetadataType.CatchedError) {
        args[item] = error;
      }
    }
    return args;
  }
}
