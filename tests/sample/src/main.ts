import { Autowired, Configuration } from "@nailyjs/core";
import { TestService } from "./test.service";

@Configuration()
export class T {
  @Autowired()
  private readonly testService: TestService;

  constructor() {}
}
