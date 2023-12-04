import { existsSync, readFileSync } from "fs";
import { Injectable } from "../decorators";
import { join } from "path";

@Injectable()
export class PackageConfiguration implements NIOC.Configure {
  public getConfigure() {
    if (!existsSync(join(process.cwd(), "package.json"))) {
      throw new Error(`Cannot find package.json`);
    }
    const file = readFileSync(join(process.cwd(), "package.json")).toString();
    return JSON.parse(file);
  }
}
