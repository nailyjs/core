import { Type } from "@nailyjs/core";
import { ImplNailyBackendGuard, ImplNailyBackendPipe } from "../typings";
import { NailyBackendConstant } from "../constants";
import isClass from "is-class";

/**
 * ### UsePipe
 *
 * The `UsePipe` decorator is used to bind the pipe to the controller method or the controller class.
 *
 * @author Zero <gczgroup@qq.com>
 * @date 2024/02/28
 * @export
 * @param {(ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)} pipe - The pipe to use.
 * @return {(ClassDecorator & MethodDecorator)}
 */
export function UsePipe(pipe: ImplNailyBackendPipe | Type<ImplNailyBackendPipe>): ClassDecorator & MethodDecorator {
  return (target: Object | Type, propertyKey?: string | symbol) => {
    if (propertyKey) {
      const oldPipeMetadata: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[] =
        Reflect.getMetadata(NailyBackendConstant.PIPE, target, propertyKey) || [];
      oldPipeMetadata.push(pipe);
      Reflect.defineMetadata(NailyBackendConstant.PIPE, oldPipeMetadata, target, propertyKey);
    } else if (!propertyKey && isClass(target)) {
      const ownKeys = Reflect.ownKeys(target.prototype);
      for (const key of ownKeys) {
        const oldPipeMetadata: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[] =
          Reflect.getMetadata(NailyBackendConstant.PIPE, target.prototype, key) || [];
        oldPipeMetadata.push(pipe);
        Reflect.defineMetadata(NailyBackendConstant.PIPE, oldPipeMetadata, target.prototype, key);
      }
    }
  };
}

/**
 * ### UseGuard
 *
 * The `UseGuard` decorator is used to bind the guard to the controller method or the controller class.
 *
 * @export
 * @param {(ImplNailyBackendGuard | Type<ImplNailyBackendGuard>)} guard - The guard to use.
 * @return {(ClassDecorator & MethodDecorator)}
 */
export function UseGuard(guard: ImplNailyBackendGuard | Type<ImplNailyBackendGuard>): ClassDecorator & MethodDecorator {
  return (target: Object | Type, propertyKey?: string | symbol) => {
    if (propertyKey) {
      const oldGuardMetadata: (ImplNailyBackendGuard | Type<ImplNailyBackendGuard>)[] =
        Reflect.getMetadata(NailyBackendConstant.GUARD, target, propertyKey) || [];
      oldGuardMetadata.push(guard);
      Reflect.defineMetadata(NailyBackendConstant.GUARD, oldGuardMetadata, target, propertyKey);
    } else if (!propertyKey && isClass(target)) {
      const ownKeys = Reflect.ownKeys(target.prototype);
      for (const key of ownKeys) {
        const oldGuardMetadata: (ImplNailyBackendGuard | Type<ImplNailyBackendGuard>)[] =
          Reflect.getMetadata(NailyBackendConstant.GUARD, target.prototype, key) || [];
        oldGuardMetadata.push(guard);
        Reflect.defineMetadata(NailyBackendConstant.GUARD, oldGuardMetadata, target.prototype, key);
      }
    }
  };
}
