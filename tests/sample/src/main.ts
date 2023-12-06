import { Autowired, Bean } from "@nailyjs/core/common";
import { TestService } from "./test.service";

@Bean()
export class T {
  @Autowired()
  private readonly testService: TestService;

  constructor() {
    console.log(this.testService);
  }
}
