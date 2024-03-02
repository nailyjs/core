import "reflect-metadata";
import { z } from "zod";
import { ScopeEnum } from "../constants";
import { n } from "./common.schema";

export const InjectableOptionsOptionalSchema = z
  .object({
    token: n.token().optional(),
    scope: z.nativeEnum(ScopeEnum).optional(),
    singleton: z.boolean().optional().default(true),
    initializeParams: z.array(z.any()).optional(),
  })
  .optional();
export type IInjectableOptionsOptional = z.infer<typeof InjectableOptionsOptionalSchema>;

export const InjectableOptionsSchema = z.object({
  token: n.token(),
  scope: z.nativeEnum(ScopeEnum),
  singleton: z.boolean().optional().default(true),
  initializeParams: z.array(z.any()),
});
export type IInjectableOptions = z.infer<typeof InjectableOptionsSchema>;

/**
 * ### Naily Container Schema
 *
 * The schema for the Naily Container
 *
 * @export
 * @abstract
 * @class NailyContainerSchema
 */
export abstract class NailyContainerSchema {
  public static containerConstantValue() {
    return z.object({
      value: n.constantValue(),
    });
  }

  public static containerClassValue() {
    return z.object({
      target: n.class(),
      instance: z.object({}).optional(),
    });
  }

  public static addTargetSchema() {
    return z.function(z.tuple([n.token(), n.class()]), z.void());
  }

  public static getTargetSchema() {
    return z.function(z.tuple([n.token()]), n.classValue());
  }

  public static initializeExistingTargetSchema() {
    return z.function(z.tuple([n.token(), z.array(z.any()), z.boolean().optional().default(false)]), z.any());
  }

  public static removeTargetByTokenSchema() {
    return z.function(z.tuple([n.token()]), z.void());
  }

  public static addConstantOrUpdateConstantSchema() {
    return z.function(z.tuple([n.token(), n.constantValue()]), z.void());
  }

  public static getSchema() {
    return z.function(z.tuple([n.token()]), n.containerValue());
  }
}
