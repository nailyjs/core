import { Autowired, Injectable, Logger } from "@nailyjs/core";
import { BuildCommand } from "./build.command";
import { Value } from "@nailyjs/core/backend";
import { ChildProcess, fork } from "child_process";
import chokidar from "chokidar";
import { join, relative } from "path";
import { logo } from "../logo";

@Injectable()
export class WatchCommand {
  @Autowired()
  private readonly buildCommand: BuildCommand;

  @Value("naily.cli.watch.entry", true)
  private readonly watchEntry?: string;

  @Value("naily.cli.watch.folder")
  private readonly folder: string;

  @Value("naily.cli.watch.showBuilderLog", true)
  private readonly showBuilderLog?: boolean;

  @Value("naily.cli.watch.ignore", true)
  private readonly ignore?: string[];

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

  private exit(newProcess?: ChildProcess) {
    console.log();
    new Logger().log("Exiting...");
    if (newProcess) newProcess.kill();
    process.exit();
  }

  public async watch() {
    const folder = this.folder ? join(process.cwd(), relative(process.cwd(), this.folder)) : ".";

    await this.getBuilder();
    let newProcess: ChildProcess | undefined = this.watchEntry ? this.getDevelopmentForkProcess() : undefined;

    console.log(logo);
    new Logger().log(`Watching path "${folder}"...`);
    process.on("SIGINT", () => this.exit(newProcess));
    process.on("SIGTERM", () => this.exit(newProcess));
    chokidar
      .watch(folder, {
        ignored: ["**/node_modules/**", "**/.git/**", "**/.naily/**", ...(this.ignore ? this.ignore : [])],
      })
      .on("change", async (path) => {
        console.clear();
        new Logger().log(`${relative(process.cwd(), path)} File ${path} changed`);
        await this.getBuilder();
        if (newProcess) {
          newProcess.kill();
          newProcess = this.getDevelopmentForkProcess();
        }
      });
  }
}
