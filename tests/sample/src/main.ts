import { Autowired, Bean } from "@nailyjs/core";

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
    this.testService;
  }
}

new AppService();
