import { AbstractBootstrap, Autowired, Injectable } from "@nailyjs/core";
import { prompt } from "inquirer";
import { logo } from "./logo";
import { join } from "path";
import { existsSync } from "fs";
import i18n from "./i18n";
import { ChangePackageNameHook } from "./hook/changePackageName.hook";
import { CopyHook } from "./hook/copy.hook";
import { GitHook } from "./hook/git.hook";
import { PackageManagerHook } from "./hook/packageHook.hook";

export interface Result {
  projectName: string;
  template: "sample" | "library" | "monorepo";
  git: boolean;
  packageManager: "none" | "npm" | "yarn" | "pnpm";
}

@Injectable()
export class NailyCreator {
  private $t = i18n();

  constructor() {
    console.clear();
    console.log(logo);
    this.start();
  }

  @Autowired()
  private readonly changePackageNameHook: ChangePackageNameHook;

  @Autowired()
  private readonly copyHook: CopyHook;

  @Autowired()
  private readonly gitHook: GitHook;

  @Autowired()
  private readonly packageManagerHook: PackageManagerHook;

  async start() {
    const result = await prompt<Result>([
      {
        type: "input",
        name: "projectName",
        message: this.$t.projectName,
        validate: (input: string) => {
          const regex = /^[a-zA-Z0-9_]+$/;
          if (!regex.test(input)) {
            return this.$t.projectNameTestFailed;
          } else if (existsSync(join(process.cwd(), input))) {
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
          {
            name: "Sample Monorepo",
            short: "Monorepo",
            value: "monorepo",
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
    // project path
    const basePath = join(process.cwd(), result.projectName);
    // copy template
    this.copyHook.run(join(__dirname, "..", "..", "templates", result.template), basePath);
    // git init
    this.gitHook.run(basePath, result);
    // install dependencies
    this.packageManagerHook.run(basePath, result);
    // change package name
    this.changePackageNameHook.run(basePath, result);
    console.log(this.$t.done);
  }
}

class BootStrap extends AbstractBootstrap<NailyCreator> {
  constructor() {
    super(NailyCreator);
  }
}

new BootStrap().enableInternalPlugin().run();
