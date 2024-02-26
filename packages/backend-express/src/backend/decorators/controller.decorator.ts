import { Injectable, Type } from "@nailyjs/core";
import { Router } from "express";
import { NailyExpressConstant } from "../constants";
import { IExpressMapping, RequestMethod } from "../typings/metadata.typing";

export function Controller() {
  return (target: Type) => {
    Injectable()(target);
    Reflect.defineMetadata(NailyExpressConstant.CONTROLLER, Router(), target);
  };
}

export function Get(path?: string): MethodDecorator;
export function Get(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: IExpressMapping[] = Reflect.getMetadata(NailyExpressConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.GET, path });
    Reflect.defineMetadata(NailyExpressConstant.MAPPING, oldMapping, target, propertyKey);
  };
}
