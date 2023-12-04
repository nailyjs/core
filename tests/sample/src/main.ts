import { Autowired, Bean, NailyBeanRegistry } from "@nailyjs/core";

export class AAAService {
  @Bean()
  readonly init = "Hello world";

  constructor() {
    console.log("AAAService被创建");
  }
}

export class TestService {
  @Autowired()
  private aaaService: AAAService;

  constructor() {
    console.log("TestService被创建");
  }
}

export class AppService {
  @Autowired()
  private readonly testService: TestService;

  constructor() {
    console.log("AppService被创建");
  }
}

new AppService();
console.log(NailyBeanRegistry.getRegistry());
