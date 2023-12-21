import { NailyMVCWatermark } from "../../common";
import { Injectable, Type } from "@nailyjs/core";

/**
 * Controller decorator. Use to mark a class as a controller. It will be registered in the container and can be injected into other classes then.
 *
 * @author Zero <gczgroup@qq.com>
 * @export
 * @param {string} [path]
 * @param {(Partial<Omit<NMVC.ControllerMetadata & NIOC.BeanMetadata, "path">>)} [metadata]
 * @return {ClassDecorator}
 */
export function Controller(path?: string, metadata?: Partial<Omit<NMVC.ControllerMetadata & NIOC.BeanMetadata, "path">>): ClassDecorator;
/**
 * Controller decorator. Use to mark a class as a controller. It will be registered in the container and can be injected into other classes then.
 *
 * @author Zero <gczgroup@qq.com>
 * @date 2023/12/21
 * @export
 * @param {(Partial<NMVC.ControllerMetadata & NIOC.BeanMetadata>)} [metadata]
 * @return {ClassDecorator}
 */
export function Controller(metadata?: Partial<NMVC.ControllerMetadata & NIOC.BeanMetadata>): ClassDecorator;
export function Controller(
  path: string | Partial<NMVC.ControllerMetadata & NIOC.BeanMetadata> = "/",
  metadata: Partial<Omit<NMVC.ControllerMetadata & NIOC.BeanMetadata, "path">> = {},
): ClassDecorator {
  return function (target: Type) {
    const controllerMetadata: NMVC.ControllerMetadata = {
      path: arguments.length === 1 ? (path as Partial<NMVC.ControllerMetadata & NIOC.BeanMetadata>).path : "/",
      version: arguments.length === 1 ? (path as Partial<NMVC.ControllerMetadata & NIOC.BeanMetadata>).version : undefined,
    };
    const beanMetadata: NIOC.BeanMetadata = {
      ReBind: arguments.length === 1 ? (path as Partial<NMVC.ControllerMetadata & NIOC.BeanMetadata>).ReBind : metadata ? metadata.ReBind : undefined,
      Scope: arguments.length === 1 ? (path as Partial<NMVC.ControllerMetadata & NIOC.BeanMetadata>).Scope : metadata ? metadata.Scope : undefined,
      Token: arguments.length === 1 ? (path as Partial<NMVC.ControllerMetadata & NIOC.BeanMetadata>).Token : metadata ? metadata.Token : undefined,
    };

    Injectable(beanMetadata)(target);

    const oldControllerMetadata = (Reflect.getMetadata(NailyMVCWatermark.CONTROLLER, target) as NMVC.ControllerMetadata[]) || [];
    oldControllerMetadata.push(controllerMetadata);
    Reflect.defineMetadata(NailyMVCWatermark.CONTROLLER, oldControllerMetadata, target);
  } as ClassDecorator;
}
