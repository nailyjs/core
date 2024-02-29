import { NailyContainerConstant } from "../../constants";
import { INailyInterceptBeforeArgHost, ImplNailyInterceptPlugin } from "../../typings";

export class ParameterPlugin implements ImplNailyInterceptPlugin {
  transformBefore(argHost: INailyInterceptBeforeArgHost): any[] | Promise<any[]> {
    const args = argHost.getArguments();
    const target = argHost.getTarget();
    const propertyKey = argHost.getMethodKey();
    const metadata = Reflect.getMetadata(NailyContainerConstant.INTERCEPT_PARAMETER, target, propertyKey) || [];
    for (const item in metadata) {
      if (metadata[item].type === "Parameter") {
        args[item] = argHost.getArguments()[item];
      }
    }
    return args;
  }
}
