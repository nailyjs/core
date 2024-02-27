import { Controller, Get } from "@nailyjs/backend";
import { ExpressBootStrap } from "@nailyjs/backend-express";

@Controller()
export class NailyApplication extends ExpressBootStrap {
  @Get()
  public test() {
    return "Hello World";
  }
}
