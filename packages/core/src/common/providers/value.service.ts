import { readFileSync, existsSync } from "fs";
import { Injectable } from "../decorators";
import { join } from "path";
import { load } from "js-yaml";

@Injectable()
export class NailyValueUtil {
  private static yamlJSON: any;

  public static getFileName(): `naily.yml` | `naily-${string}.yml` | null {
    const environment = process.env.NODE_ENV;
    if (!environment) {
      if (existsSync(join(process.cwd(), "naily.yml"))) {
        return `naily.yml`;
      } else return null;
    }

    if (existsSync(join(process.cwd(), `naily-${environment}.yml`))) {
      return `naily-${environment}.yml`;
    } else if (existsSync(join(process.cwd(), "naily.yml"))) {
      return `naily.yml`;
    } else return null;
  }

  public static getConfiguration() {
    const fileName = this.getFileName();
    if (!fileName) return {};
    const loadYaml = readFileSync(fileName, "utf8").toString();
    this.yamlJSON = load(loadYaml);
    return this.yamlJSON;
  }

  public static getConfigurationCache() {
    return this.yamlJSON;
  }

  public getConfiguration() {
    return NailyValueUtil.getConfiguration();
  }

  public getFileName() {
    return NailyValueUtil.getFileName();
  }

  public getConfigurationCache() {
    return NailyValueUtil.getConfigurationCache();
  }
}
