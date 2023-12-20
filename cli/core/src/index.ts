import { Autowired, Configuration } from "@nailyjs/core/backend";
import { Command } from "commander";
import { logo } from "./logo";
import { BuildCommand } from "./commands/build.command";
import { CreateCommand } from "./commands/create.command";

@Configuration()
export class CLIConfiguration {
  public readonly name = "naily";
  public readonly version = "0.0.1";
  public readonly description = "Naily CLI";

  public readonly program = new Command();

  @Autowired()
  private readonly buildCommand: BuildCommand;

  @Autowired()
  private readonly createCommand: CreateCommand;

  constructor() {
    this.program.name(this.name).version(this.version).description(this.description).addHelpText("beforeAll", logo);
    this.program
      .command("build")
      .alias("b")
      .description("Build the project")
      .action(() => {
        console.log(logo);
        this.buildCommand.build();
      });

    this.program
      .command("create [dir]")
      .alias("c")
      .description("Create a new project")
      .option("-p --package-manager <packageManager>", "Package manager to use (npm or yarn)", "npm")
      .action((dir: string, options: { packageManager: string }) => this.createCommand.create(dir, options));
    this.program.parse(process.argv);
  }
}
