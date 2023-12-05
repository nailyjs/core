import { Bean, Configuration, Injectable } from "@nailyjs/core";
import { Get, RestController } from "@nailyjs/backend";
import { ExpressApp } from "@nailyjs/backend-express";

@Injectable()
export class IntPipe implements NBackend.Pipe {
  @Bean()
  public transform(value: any, metadata: NBackend.PipeParamMetadata) {
    console.log(metadata);
    return value;
  }
}

@RestController()
export class TestController {
  @Get()
  public test() {
    return "Hell";
  }
}

@Configuration()
export class BootStrap {
  public static async main() {
    new ExpressApp().run();
  }
}
