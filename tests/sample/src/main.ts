import { Autowired, Bean } from "@nailyjs/core";

@Bean()
export class TestService {}

export class AppService {
  @Autowired()
  private readonly testService: TestService;

  constructor() {
    console.log(this.testService);
  }
}

new AppService();
