import { ExpressBootStrap } from "@nailyjs/backend-express";
import { Controller, Get } from "@nailyjs/backend";
import { InjectValuePlugin } from "@nailyjs/core/backend";
import { AddressInfo } from "net";

@Controller()
export class NailyApplication extends ExpressBootStrap {
  @Get()
  public test() {
    return "Hello World!!!";
  }
}

new NailyApplication()
  .enableInternalPlugin()
  .usePlugin(new InjectValuePlugin())
  .run()
  .then((server) => {
    console.log(`Server is running on port ${(server.address() as AddressInfo).port}`);
  });
