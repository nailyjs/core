import { AbstractBootstrap } from "@nailyjs/core";
import { ExpressService } from "../providers/express.service";
import express from "express";
import { NailyExpressPlugin } from "../plugins/express.plugin";
import { IncomingMessage, Server, ServerResponse } from "http";

export class ExpressBootStrap extends AbstractBootstrap<ExpressService> {
  private readonly app = express();

  constructor() {
    super(ExpressService);
  }

  public run() {
    super.enableInternalPlugin();
    super.usePlugin(new NailyExpressPlugin(this.plugins, this.app));
    const service: ExpressService = super.run();
    if (!service.port)
      throw new Error(
        "naily.backend.express.port is not defined or not use InjectValuePlugin, please define it in your naily.yml and enable the InjectValuePlugin",
      );
    return new Promise<Server<typeof IncomingMessage, typeof ServerResponse>>((resolve) => {
      const server = this.app.listen(service.port, () => {
        resolve(server);
      });
    });
  }
}
