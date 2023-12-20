import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

export function copyFolderRecursiveSync(source: string, target: string) {
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
      console.log(`CREATE ${targetPath.replace(`${process.cwd()}/`, "")}`);
    } else if (stat.isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
      console.log(`CREATE ${targetPath.replace(`${process.cwd()}/`, "")}`);
    }
  });
}
