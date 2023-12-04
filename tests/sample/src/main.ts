import { Bean, Inject } from "@nailyjs/core";

export class AAAService {
  @Bean()
  readonly init = "Hello world";
}

export class TestService {
  @Inject(AAAService)
  private aaaService: AAAService;

  constructor() {
    console.log(this.aaaService);
  }
}

export class AppService {
  @Inject(TestService)
  private readonly testService: TestService;

  constructor() {
    console.log(this.testService);
  }
}

new AppService();
