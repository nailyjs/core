import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

export default function (outDir: string = "lib/types", forceNoEmit = false) {
  return new Promise<true | string>((resolve, reject) => {
    const cwd = process.cwd();
    if (existsSync(join(cwd, "tsconfig.build.json"))) {
      try {
        execSync(forceNoEmit ? "tsc --noEmit" : `tsc -p tsconfig.build.json --declaration --emitDeclarationOnly --outDir ${outDir}}`, {
          cwd,
          stdio: "inherit",
        });
        return resolve(true);
      } catch (error) {
        const err = new Error("Failed to build d.ts, please check the typescript error message above.");
        err.stack = undefined;
        reject(err);
      }
    } else if (typeof forceNoEmit === "boolean") {
      try {
        execSync("tsc --noEmit", {
          cwd,
          stdio: "inherit",
        });
        return resolve(true);
      } catch (error) {
        resolve("Type check failed, please check the typescript error message above.");
      }
    }
  });
}
