import { existsSync, readFileSync } from "fs";
import { Injectable } from "../../common/index.js";
import { join } from "path";
import Jexl from "jexl";

@Injectable()
export class PackageConfiguration implements NIOC.Configure {
  public getConfigure(_builder: typeof Jexl, isOptional: boolean) {
    let isNoExist = false;

    if (!existsSync(join(process.cwd(), "package.json"))) {
      isNoExist = true;
      if (!isOptional) throw new Error(`Cannot find package.json`);
    }

    if (isNoExist) return {};

    const file = readFileSync(join(process.cwd(), "package.json")).toString();
    return JSON.parse(file);
  }
}
