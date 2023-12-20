import { Configuration } from "@nailyjs/core/common";
import { prompt } from "inquirer";
import { logo } from "./logo";
import { copyFolderRecursiveSync } from "./copy";
import { join } from "path";
import { existsSync } from "fs";

interface Result {
  projectName: string;
  template: "sample" | "library";
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
    ]);
    copyFolderRecursiveSync(join(__dirname, "..", "..", "templates", result.template), join(process.cwd(), result.projectName));
  }
}
