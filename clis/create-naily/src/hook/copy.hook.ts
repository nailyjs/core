import { Injectable } from "@nailyjs/core";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

@Injectable()
export class CopyHook {
  run(source: string, target: string) {
    if (!existsSync(target)) {
      mkdirSync(target);
    }

    const files = readdirSync(source);

    files.forEach((file) => {
      const sourcePath = join(source, file);
      const targetPath = join(target, file);

      const stat = statSync(sourcePath);
      if (stat.isFile()) {
        copyFileSync(sourcePath, targetPath);
        console.log(`FILE   ${targetPath.replace(`${process.cwd()}/`, "")}`);
      } else if (stat.isDirectory()) {
        this.run(sourcePath, targetPath);
        console.log(`FOLDER ${targetPath.replace(`${process.cwd()}/`, "")}`);
      }
    });
  }
}
