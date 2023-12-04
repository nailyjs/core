import { Bean, NailyBeanRegistry, Service } from "@nailyjs/core";

@Service({ Token: "AAA" })
export class AppService {
  @Bean({ Token: "BBB" })
  readonly T = "Hello";

  constructor() {
    console.log("AppService被创建");
  }
}

console.log(NailyBeanRegistry.getRegistry());
