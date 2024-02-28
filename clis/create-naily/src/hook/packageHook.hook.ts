import { Injectable } from "@nailyjs/core";
import { Result } from "..";
import { execSync } from "child_process";

@Injectable()
export class PackageManagerHook {
  run(basePath: string, result: Result) {
    if (result.packageManager !== "none") {
      execSync(`${result.packageManager} install`, {
        cwd: basePath,
        stdio: "inherit",
      });
    }
  }
}
