import { readFileSync } from "fs";
import { join } from "path";

export function isEsm(): boolean {
  const packageJSON = readFileSync(join(process.cwd(), "package.json"), "utf-8").toString() || "{}";
  const packageInfo = JSON.parse(packageJSON);
  if (!packageInfo.type) return false;
  return packageInfo.type === "module";
}
