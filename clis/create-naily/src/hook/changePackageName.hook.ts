import { Injectable } from "@nailyjs/core";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Result } from "..";
import { execSync } from "child_process";

@Injectable()
export class ChangePackageNameHook {
  run(basePath: string, result: Result) {
    const packageJSONPath = join(basePath, "package.json");
    const packageJSON = readFileSync(packageJSONPath).toString();
    const packageJSONParsed = JSON.parse(packageJSON);
    packageJSONParsed.name = result.projectName.toLowerCase();
    writeFileSync(packageJSONPath, JSON.stringify(packageJSONParsed));
    console.log("CHANGE Changed package.json name to " + result.projectName.toLowerCase());
    execSync(`npm run format`, {
      cwd: basePath,
      stdio: "inherit",
    });
  }
}
