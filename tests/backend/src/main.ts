import { Controller, ExpressBootStrap, Get } from "@nailyjs/backend-express";

@Controller()
export class TestController {
  @Get()
  public async test() {
    return "Hello World";
  }
}

async function main() {
  const app = new ExpressBootStrap();
  app.run();
  console.log(app.getNailyContainer().getAll());
}
main();
