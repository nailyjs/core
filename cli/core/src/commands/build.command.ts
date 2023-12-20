import { Injectable, Value } from "@nailyjs/core/backend";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { sync } from "glob";
import { extname, relative } from "path";
import { rollup, RollupLog, LogLevel, LogOrStringHandler } from "rollup";

interface CheckProjectConfiguration {
  src: string;
  output: string;
}

interface Input {
  [k: string]: string;
}

@Injectable()
export class BuildCommand {
  @Value("naily.cli.src", true)
  private readonly src?: string;

  @Value("naily.cli.output", true)
  private readonly output?: string;

  @Value("naily.cli.debug", true)
  private readonly debug?: "debug" | "rollup";

  public checkProjectConfiguration(projectConfiguration: CheckProjectConfiguration) {
    if (!projectConfiguration.src || !projectConfiguration.output) {
      throw new Error("src and output must be specified");
    }
    if (projectConfiguration.src.startsWith(".") || projectConfiguration.src.startsWith("/")) {
      throw new Error("src must be a relative path, and cannot start with `.` or `/`");
    }
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
          return console.log(log);
        }

        if (log.code !== "EMPTY_BUNDLE") {
          return defaultHandler(level, log);
        }
      },
    });
  }

  public async build() {
    const projectConfiguration: CheckProjectConfiguration = {
      src: this.src,
      output: this.output || "lib",
    };
    this.checkProjectConfiguration(projectConfiguration);
    const [paths, input] = this.getInputs(projectConfiguration);
    const bundle = await this.getBundle(paths, input);

    return Promise.all([
      new Promise(async (resolve) => {
        console.log("Starting build cjs...");
        const writer = await bundle.write({
          format: "commonjs",
          sourcemap: "inline",
          dir: "lib/cjs",
          strict: false,
          exports: "auto",
        });
        console.log("Build cjs success");
        resolve(writer);
      }),
      new Promise(async (resolve) => {
        console.log("Starting build esm...");
        const writer = await bundle.write({
          format: "module",
          sourcemap: "inline",
          dir: "lib/esm",
          strict: false,
          exports: "named",
        });
        console.log("Build esm success");
        resolve(writer);
      }),
    ])
      .then(() => {
        console.log("build success");
      })
      .catch((err) => {
        console.error("build failed");
        console.error(err);
      });
  }
}
