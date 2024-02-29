import { Injectable, Type } from "@nailyjs/core";
import { ImplNailyBackendPipe } from "../typings";

@Injectable()
export abstract class NailyBackendPlugin {
  rewritePipes(pipes: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[]): (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[] {
    return pipes;
  }

  rewriteGuards(guards: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[]): (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[] {
    return guards;
  }

  rewritePlugins(plugins: NailyBackendPlugin[]): NailyBackendPlugin[] {
    return plugins;
  }

  rewriteAdapter(adapter: Type<any>): Type<any> {
    return adapter;
  }
}
