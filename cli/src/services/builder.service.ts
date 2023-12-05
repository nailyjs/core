import { Service, Value } from "@nailyjs/core";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";
import { sync } from "glob";
import { extname, join, relative } from "path";
import { rollup } from "rollup";

@Service()
export class BuilderService {
  @Value("naily.cli.outDir", true)
  private readonly outDir: string;

  private getExternal() {
    const packageJSONFile = readFileSync(join(process.cwd(), "package.json")).toString() as any;
    const packageJSON = JSON.parse(packageJSONFile);
    const deps = Object.keys(packageJSON.dependencies || {});
    const devDeps = Object.keys(packageJSON.devDependencies || {});
    const peerDeps = Object.keys(packageJSON.peerDependencies || {});
    return [...deps, ...devDeps, ...peerDeps].filter((dep) => (dep === "tslib" ? undefined : dep));
  }

  public async build(defaultOutDir = ".naily") {
    console.log("Starting...");
    const builder = await rollup({
      plugins: [nodeResolve(), typescript()],
      external: [...this.getExternal()],
      input: Object.fromEntries(
        sync("src/**/*.ts", { absolute: true }).map((file) => {
          return [
            // 这里将删除 `src/` 以及每个文件的扩展名。
            // 因此，例如 src/nested/foo.js 会变成 nested/foo
            relative("src", file.slice(0, file.length - extname(file).length)),
            // 这里可以将相对路径扩展为绝对路径，例如
            // src/nested/foo 会变成 /project/src/nested/foo.js
            file,
          ];
        }),
      ),
    });
    console.log("Build CJS...");
    await builder.write({
      format: "commonjs",
      sourcemap: "inline",
      dir: `${this.outDir ? this.outDir : defaultOutDir}/cjs`,
      strict: false,
    });
    console.log("Build ESM...");
    await builder.write({
      format: "module",
      sourcemap: "inline",
      dir: `${this.outDir ? this.outDir : defaultOutDir}/esm`,
      strict: false,
    });
    console.log("Build Ended");
  }
}
