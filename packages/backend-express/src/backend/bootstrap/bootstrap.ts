import { AbstractBootstrap } from "@nailyjs/core";
import { ExpressService } from "../providers/express.service";
import express from "express";
import { NailyExpressPlugin } from "../plugins/express.plugin";

export class ExpressBootStrap extends AbstractBootstrap<ExpressService> {
  private readonly app = express();

  constructor() {
    super(ExpressService);
  }

  run() {
    super.enableInternalPlugin();
    super.usePlugin(new NailyExpressPlugin(this.plugins, this.app));
    super.run();
    return this.app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  }
}
