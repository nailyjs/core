import { AutoInject } from "../constants";
import { IType } from "../typings";
import { NailyContainer } from "./container.class";

export class NailyContainerUtil {
  /**
   * ### Transform Parameters
   *
   * Transforms the parameters of a target class into an array of instances.
   *
   * @static
   * @param {IType} target - The target class
   * @param {any[]} [existParams=[]] - The existing parameters
   * @return {any[]} - The transformed parameters
   * @memberof NailyContainerUtil
   */
  public static transformParameters(target: IType, existParams: any[] = []): any[] {
    const parameters: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
    return parameters.map((param, index) => {
      if (existParams[index] && existParams[index] === AutoInject) return existParams[index];
      if (param && param.name) {
        const classValue = NailyContainer.safeGetTarget(param.name);
        if (classValue) return NailyContainer.initializeExistingTarget(param.name, [], true);
      }
      return undefined;
    });
  }
}
