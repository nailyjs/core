import { Controller, Get, Query } from "@nailyjs/backend";
import { ExpressBootStrap } from "@nailyjs/backend-express";

@Controller()
export class NailyApplication extends ExpressBootStrap {
  @Get()
  public test(@Query() query: any) {
    console.log(query);
    return "Hello World";
  }
}
