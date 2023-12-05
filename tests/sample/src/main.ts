import { Bean, Configuration } from "@nailyjs/core";
import { Get, NailyControllerRegistry, Query, RestController } from "@nailyjs/backend";

export class IntPipe implements NBackend.Pipe {
  constructor(private readonly aaa: string) {}

  @Bean()
  public transform(value: any, metadata: NBackend.PipeParamMetadata) {
    console.log(metadata);
    return Number(value);
  }
}

@RestController()
export class TestController {
  @Get()
  public test(@Query("id", new IntPipe("aaa")) query: string) {
    return query;
  }
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
