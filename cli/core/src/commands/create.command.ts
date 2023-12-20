import { Injectable } from "@nailyjs/core/common";
import { execSync } from "child_process";

@Injectable()
export class CreateCommand {
  public create(dir: string, { packageManager }: { packageManager: string } = { packageManager: "npm" }) {
    if (!packageManager) packageManager = "npm";
    if (!dir) dir = "";
    if (dir.startsWith(".") || dir.startsWith("/")) throw new Error("Invalid directory, cannot start with . or /");

    console.log(`Creating project in ${dir ? dir : process.cwd()}...`);
    execSync(`${packageManager} create naily-beta`, {
      stdio: "inherit",
      cwd: dir ? dir : process.cwd(),
      env: process.env,
    });
  }
}
