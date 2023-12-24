import { Injectable } from "@nailyjs/core/common";
import { Result } from "..";
import { execSync } from "child_process";

@Injectable()
export class GitHook {
  run(basePath: string, result: Result) {
    if (result.git) {
      execSync("git init", {
        cwd: basePath,
        stdio: "inherit",
      });
    }
  }
}
