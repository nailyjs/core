import { Configuration } from "@nailyjs/core/common";
import { prompt } from "inquirer";
import { logo } from "./logo";
import { copyFolderRecursiveSync } from "./copy";
import { join } from "path";
import { existsSync } from "fs";
import { execSync } from "child_process";

interface Result {
  projectName: string;
  template: "sample" | "library";
  git: boolean;
  packageManager: "none" | "npm" | "yarn" | "pnpm";
}

@Configuration()
export class NailyCreator {
  constructor() {
    console.log(logo);
    this.start();
  }

  async start() {
    const result = await prompt<Result>([
      {
        type: "input",
        name: "projectName",
        message: "Please enter the project name:",
        validate(input) {
          if (existsSync(join(process.cwd(), input))) {
            return "The file or folder already exists! Please enter another name, we don't want to overwrite anything!";
          } else {
            return true;
          }
        },
      },
      {
        type: "list",
        name: "template",
        message: "Please select a template:",
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
        message: "Initialize a git repository?",
        default: true,
      },
      {
        type: "list",
        name: "packageManager",
        message: "Please select a package manager to install dependencies:",
        choices: [
          {
            name: "I will install dependencies myself",
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
