import { Configuration } from "@nailyjs/core";
import { Get, NailyControllerRegistry, RestController } from "@nailyjs/backend";

@RestController()
export class TestController {
  @Get()
  public test() {}
}

@Configuration()
export class BootStrap {
  public static main() {
    const mapper = NailyControllerRegistry.getMapper();
    console.dir(mapper, {
      depth: null,
    });
  }
}
