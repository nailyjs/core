import { Configuration } from "@nailyjs/core/common";
import { prompt } from "inquirer";
import { logo } from "./logo";
import { copyFolderRecursiveSync } from "./copy";
import { join } from "path";
import { existsSync } from "fs";
import { execSync } from "child_process";
import i18n from "./i18n";

interface Result {
  projectName: string;
  template: "sample" | "library";
  git: boolean;
  packageManager: "none" | "npm" | "yarn" | "pnpm";
}

@Configuration()
export class NailyCreator {
  private $t = i18n();

  constructor() {
    console.log(logo);
    this.start();
  }

  async start() {
    const result = await prompt<Result>([
      {
        type: "input",
        name: "projectName",
        message: this.$t.projectName,
        validate: (input) => {
          if (existsSync(join(process.cwd(), input))) {
            return this.$t.projectNameFileOrFolderExists;
          } else {
            return true;
          }
        },
      },
      {
        type: "list",
        name: "template",
        message: this.$t.template,
        choices: [
          {
            name: "Sample Application",
            short: "Sample",
            value: "sample",
          },
          {
            name: "Sample Library",
            short: "Library",
            value: "library",
          },
        ],
      },
      {
        type: "confirm",
        name: "git",
        message: this.$t.git,
        default: true,
      },
      {
        type: "list",
        name: "packageManager",
        message: this.$t.packageManager,
        choices: [
          {
            name: this.$t.installMyself,
            value: "none",
          },
          {
            name: "npm",
            value: "npm",
          },
          {
            name: "yarn",
            value: "yarn",
          },
          {
            name: "pnpm",
            value: "pnpm",
          },
          {
            name: "cnpm",
            value: "cnpm",
          },
          {
            name: "bun",
            value: "bun",
          },
        ],
      },
    ]);
    copyFolderRecursiveSync(join(__dirname, "..", "..", "templates", result.template), join(process.cwd(), result.projectName));
    if (result.git) {
      execSync("git init", {
        cwd: join(process.cwd(), result.projectName),
        stdio: "inherit",
      });
    }
    if (result.packageManager !== "none") {
      execSync(`${result.packageManager} install`, {
        cwd: join(process.cwd(), result.projectName),
        stdio: "inherit",
      });
    }
  }
}
