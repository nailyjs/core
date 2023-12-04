import { Autowired, Configuration } from "@nailyjs/core";
import { Command } from "commander";
import { BuilderService } from "./services/builder.service";
import { execSync } from "child_process";

@Configuration()
export class CliBootStrap {
  private readonly program = new Command().version("0.21.0").description("Naily CLI").addHelpText("beforeAll", "NAILY \n");

  @Autowired()
  private readonly builderService: BuilderService;

  constructor() {
    this.program
      .command("build <name>")
      .description("Build using rollup")
      .action(async (name) => {
        if (name === "app") {
          await this.builderService.build();
        } else if (name === "lib") {
          await this.builderService.build("lib");
          console.log("Starting Build Declare...");
          execSync("tsc -b tsconfig.build.json", {
            stdio: "inherit",
            cwd: process.cwd(),
          });
          console.log("Builded");
        } else {
          throw new Error(`Cannot find command`);
        }
      });

    this.program.parse(process.argv);
  }
}
