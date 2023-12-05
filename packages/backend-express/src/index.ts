import "@nailyjs/backend";
import { Server } from "http";
import express from "express";
import { Autowired, Bean, Injectable, Value } from "@nailyjs/core";
import { NailyControllerRegistry } from "@nailyjs/backend";
import { ExpressAnalyseService } from "./services/analyse.service";

@Injectable()
export class ExpressApp implements NBackend.Adapter.BootStrap {
  private app = express();

  @Value("naily.backend.express.port")
  private port: number;

  @Autowired()
  private readonly analyseService: ExpressAnalyseService;

  @Bean()
  public run(): Promise<Server> {
    if (!this.port) this.port = 3000;
    if (Number.isNaN(parseInt(this.port.toString()))) throw new Error("naily.backend.express.port must be a int");

    const mapper = NailyControllerRegistry.getMapper();
    const routers = this.analyseService.analyse(mapper);

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
