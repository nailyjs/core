import { CheckProjectConfiguration, Input } from "../typings";
import { CheckUtilService } from "../utils/check.util";
import { Autowired, Injectable, Logger, Value } from "@nailyjs/core/backend";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { sync } from "glob";
import { extname, join, relative } from "path";
import { rollup, RollupLog, LogLevel, LogOrStringHandler, RollupOutput } from "rollup";

interface Builder {
  beforeCjsBuild?(): Promise<void> | void;
  beforeEsmBuild?(): Promise<void> | void;
  afterCjsBuild?(): Promise<void> | void;
  afterEsmBuild?(): Promise<void> | void;
}

@Injectable()
export class BuildCommand {
  @Value("naily.cli.src", true)
  private readonly src?: string;

  @Value("naily.cli.output", true)
  private readonly output?: string;

  @Value("naily.cli.debug", true)
  private readonly debug?: "debug" | "rollup";

  @Autowired()
  private readonly checkUtilService: CheckUtilService;

  public checkProjectConfiguration(projectConfiguration: CheckProjectConfiguration) {
    if (!projectConfiguration.src || !projectConfiguration.output) {
      new Logger().error("src and output must be specified");
      throw new Error("src and output must be specified");
    }
    this.checkUtilService.checkStringIfRelativePath(projectConfiguration.src);
  }

  public getInputs(projectConfiguration: CheckProjectConfiguration): [string[], Input] {
    const paths: string[] = [];
    const input = Object.fromEntries(
      sync(`${projectConfiguration.src}**/*.{ts,tsx}`, { absolute: true }).map((file) => {
        paths.push(file);
        return [
          // 这里将删除 `src/` 以及每个文件的扩展名。
          // 因此，例如 src/nested/foo.js 会变成 nested/foo
          relative("src", file.slice(0, file.length - extname(file).length)),
          // 这里可以将相对路径扩展为绝对路径，例如
          // src/nested/foo 会变成 /project/src/nested/foo.js
          file,
        ];
      }),
    );
    return [paths, input];
  }

  public getBundle(paths: string[], input: Input) {
    return rollup({
      input,
      plugins: [nodeResolve(), typescript(), commonjs()],
      external(id) {
        if (paths.includes(id)) return false;
        return true;
      },
      onLog: (level: LogLevel, log: RollupLog, defaultHandler: LogOrStringHandler) => {
        if (this.debug && this.debug === "rollup") {
          return defaultHandler(level, log);
        } else if (this.debug && this.debug === "debug") {
          return new Logger().log(log);
        }

        if (log.code !== "EMPTY_BUNDLE") {
          return defaultHandler(level, log);
        }
      },
    });
  }

  public async builder(options: Builder = {}): Promise<[RollupOutput, RollupOutput]> {
    const projectConfiguration: CheckProjectConfiguration = {
      src: this.src,
      output: this.output || "lib",
    };
    this.checkProjectConfiguration(projectConfiguration);
    const [paths, input] = this.getInputs(projectConfiguration);
    const bundle = await this.getBundle(paths, input);

    return Promise.all([
      new Promise<RollupOutput>(async (resolve) => {
        if (options.beforeCjsBuild) await options.beforeCjsBuild();
        const writer = await bundle.write({
          format: "commonjs",
          sourcemap: "inline",
          dir: join(projectConfiguration.output, "cjs"),
          strict: false,
          exports: "auto",
        });
        if (options.afterCjsBuild) await options.afterCjsBuild();
        resolve(writer);
      }),
      new Promise<RollupOutput>(async (resolve) => {
        if (options.beforeEsmBuild) await options.beforeEsmBuild();
        const writer = await bundle.write({
          format: "module",
          sourcemap: "inline",
          dir: join(projectConfiguration.output, "esm"),
          strict: false,
          exports: "named",
        });
        if (options.afterEsmBuild) await options.afterEsmBuild();
        resolve(writer);
      }),
    ]);
  }

  public async build() {
    this.builder({
      beforeCjsBuild() {
        new Logger().log("Starting build cjs...");
      },
      afterCjsBuild() {
        new Logger().log("Build cjs success");
      },
      beforeEsmBuild() {
        new Logger().log("Starting build esm...");
      },
      afterEsmBuild() {
        new Logger().log("Build esm success");
      },
    })
      .then(() => {
        new Logger().log("build success");
      })
      .catch((err) => {
        new Logger().error("build failed");
        console.error(err);
      });
  }
}
