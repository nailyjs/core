import { Autowired, Injectable, NailyBeanFactory, Value } from "@nailyjs/core/backend";
import { TestService } from "./test.service";

@Injectable()
export class T {
  @Autowired()
  private readonly testService: TestService;

  @Autowired()
  private readonly testService2: TestService;

  @Value("test")
  readonly test: string;
}

console.log(new NailyBeanFactory(T).createInstance().test);
