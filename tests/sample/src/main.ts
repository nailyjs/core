import { Autowired, Injectable, NailyBeanRegistry } from "@nailyjs/core";
import { TestService } from "./test.service";

@Injectable()
export class T {
  @Autowired()
  private readonly testService: TestService;

  @Autowired()
  private readonly testService2: TestService;
}

console.log(NailyBeanRegistry.getRegistry());
