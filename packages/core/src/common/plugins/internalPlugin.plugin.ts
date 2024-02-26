import { InjectPropertyPlugin } from "./injectProperty.plugin";
import { InterceptMethodPlugin } from "./interceptMethod.plugin";

export const InternalPlugin = [new InjectPropertyPlugin(), new InterceptMethodPlugin()];
