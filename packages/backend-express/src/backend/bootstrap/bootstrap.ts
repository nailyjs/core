import type {} from "express-serve-static-core";
import express from "express";
import { ExpressAdapter } from "./adapter";
import { ExpressService } from "../providers/express.service";
import { IncomingMessage, Server, ServerResponse } from "http";
import { AbstractNailyBackendBootStrap } from "@nailyjs/backend";

export class ExpressBootStrap extends AbstractNailyBackendBootStrap<ExpressService> {
  private readonly app = express();

  constructor() {
    super(ExpressService);
  }

  public getApp() {
    return this.app;
  }

  /**
   * ### Enable body parser
   *
   * Enable body parser for express.
   *
   * @return {this}
   * @memberof ExpressBootStrap
   */
  public enableBodyParser(): this {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    return this;
  }

  public useMiddleware(middleware: express.RequestHandler): this {
    this.app.use(middleware);
    return this;
  }

  public run() {
    super.initAdapter(new ExpressAdapter(this.app));
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
