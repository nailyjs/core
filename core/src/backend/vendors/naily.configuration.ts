import { existsSync, readFileSync } from "fs";
import { Injectable } from "../../common/index.js";
import { join } from "path";
import { parse } from "yaml";
import Jexl from "jexl";

@Injectable()
export class NailyConfiguration implements NIOC.Configure {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getConfigure(_builder: typeof Jexl, isOptional: boolean) {
    if (!isOptional) {
      if (!existsSync(join(process.cwd(), "naily.yml"))) {
        throw new Error(`Cannot find naily.yml`);
      }
    }
    const file = readFileSync(join(process.cwd(), "naily.yml")).toString();
    return parse(file);
  }
}
