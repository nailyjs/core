import { Autowired, Injectable, Logger } from "@nailyjs/core";
import { BuildCommand } from "./build.command";
import { Value } from "@nailyjs/core/backend";
import { CheckUtilService } from "../utils/check.util";
import { watch } from "fs";
import { ChildProcess, fork } from "child_process";

@Injectable()
export class WatchCommand {
  @Autowired()
  private readonly buildCommand: BuildCommand;

  @Autowired()
  private readonly checkUtilService: CheckUtilService;

  @Value("naily.cli.watch.entry", true)
  private readonly watchEntry?: string;

  @Value("naily.cli.watch.folder")
  private readonly folder: string;

  @Value("naily.cli.watch.showBuilderLog", true)
  private readonly showBuilderLog?: boolean;

  private getBuilder() {
    return this.buildCommand.builder({
      beforeCjsBuild: () => {
        if (this.showBuilderLog) new Logger().log("Starting build cjs...");
      },
      afterCjsBuild: () => {
        if (this.showBuilderLog) new Logger().log("Build cjs success");
      },
      beforeEsmBuild: () => {
        if (this.showBuilderLog) new Logger().log("Starting build esm...");
      },
      afterEsmBuild: () => {
        if (this.showBuilderLog) new Logger().log("Build esm success");
      },
    });
  }

  private getDevelopmentForkProcess() {
    return fork(this.watchEntry, {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "development",
      },
    });
  }

  public async watch() {
    const isString = this.checkUtilService.checkStringIfRelativePath(this.folder);
    if (!isString) throw new Error("naily.cli.watch.folder must be a string");

    await this.getBuilder();
    let newProcess: ChildProcess | undefined = this.watchEntry ? this.getDevelopmentForkProcess() : undefined;

    watch(this.folder, { recursive: true }, async (event, filename) => {
      console.clear();
      new Logger().log(`${event.toUpperCase()} File ${filename} changed`);
      await this.getBuilder();

      if (newProcess) {
        newProcess.kill();
        newProcess = this.getDevelopmentForkProcess();
      }
    });
  }
}
