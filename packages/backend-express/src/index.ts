import "@nailyjs/backend";
import { Server } from "http";
import express from "express";
import { Injectable, Value } from "@nailyjs/core";
import { NailyControllerRegistry } from "@nailyjs/backend";
import { AnalyseService } from "./services/analyse.service";

@Injectable()
export class ExpressApp implements NBackend.Adapter.BootStrap {
  private app = express();

  @Value("naily.backend.express.port")
  private port: number;

  public run(): Promise<Server> {
    if (!this.port) this.port = 3000;
    if (Number.isNaN(parseInt(this.port.toString()))) throw new Error("naily.backend.express.port must be a int");

    const mapper = NailyControllerRegistry.getMapper();
    const routers = new AnalyseService(mapper).analyse();

    for (const router of routers) {
      this.app.use(router);
    }

    return new Promise((resolve) => {
      const server = this.app.listen(this.port, () => {
        resolve(server);
      });
    });
  }
}
