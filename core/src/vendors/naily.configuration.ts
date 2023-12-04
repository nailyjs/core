import { existsSync, readFileSync } from "fs";
import { Injectable } from "../decorators";
import { join } from "path";
import { parse } from "yaml";

@Injectable()
export class NailyConfiguration implements NIOC.Configure {
  public getConfigure() {
    if (!existsSync(join(process.cwd(), "naily.yml"))) {
      throw new Error(`Cannot find naily.yml`);
    }
    const file = readFileSync(join(process.cwd(), "naily.yml")).toString();
    return parse(file);
  }
}
