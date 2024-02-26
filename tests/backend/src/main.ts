import { AbstractBootstrap, Inject, Injectable, ImplNailyService, ScopeEnum } from "@nailyjs/core";

@Injectable({ scope: ScopeEnum.Transient })
export class ChildService implements ImplNailyService {
  onReady() {
    console.log("ChildService is ready");
  }

  helloWorld() {}
}

@Injectable()
export class MainService implements ImplNailyService {
  @Inject()
  private readonly childService: ChildService;

  onReady() {
    console.log("MainService is ready");
    this.childService.helloWorld();
  }
}

class BootStrap<T> extends AbstractBootstrap<T> {}

async function main() {
  const app = new BootStrap(MainService);
  app.enableInternalPlugin();
  app.run();
  console.log(app.getNailyContainer());
}
main();
