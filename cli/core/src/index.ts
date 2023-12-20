import { Autowired, Configuration } from "@nailyjs/core/backend";
import { Command } from "commander";
import { logo } from "./logo";
import { BuildCommand } from "./commands/build.command";

@Configuration()
export class CLIConfiguration {
  public readonly name = "naily";
  public readonly version = "0.0.1";
  public readonly description = "Naily CLI";

  public readonly program = new Command();

  @Autowired()
  private readonly buildCommand: BuildCommand;

  constructor() {
    this.program.name(this.name).version(this.version).description(this.description).addHelpText("beforeAll", logo);
    this.program
      .command("build")
      .alias("b")
      .description("Build the project")
      .action(() => this.buildCommand.build());
    this.program.parse(process.argv);
  }
}
