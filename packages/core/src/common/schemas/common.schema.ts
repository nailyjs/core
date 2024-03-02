import { isClass } from "is-class";
import { IContainerConstantValue, IToken, IType } from "../typings";
import { z } from "zod";

/**
 * Common schemas for validation and serialization of data.
 *
 * @export
 * @abstract
 * @class n
 */
export abstract class n {
  /**
   * Check if the value is a class
   *
   * @static
   * @memberof n
   */
  public static class<Instance>() {
    return z.custom<IType<Instance>>(
      (data) => isClass(data),
      (data) => ({
        message: `Invalid class type: ${data ? data : "type"} is not a valid class.`,
      }),
    );
  }

  /**
   * Check if the value is a class token
   *
   * @static
   * @return
   * @memberof n
   */
  public static token() {
    return z.custom<IToken>(
      (data) => {
        if (typeof data === "string") return true;
        if (typeof data === "symbol") return true;
        if (typeof data === "function") return true;
        if (isClass(data)) return true;
        return false;
      },
      (data) => ({
        message: `Invalid token type: The ${data ? data : "token"} must be a string, symbol, function or class.`,
      }),
    );
  }

  /**
   * Check if the value is a constant value
   *
   * @static
   * @memberof n
   */
  public static constantValue() {
    return z.custom<IContainerConstantValue>((data) => {
      if (typeof data !== "object") return false;
      const value = data as IContainerConstantValue;
      if (value.value === null) return true;
      if (value.value === undefined) return true;
      if (typeof value.value === "string") return true;
      if (typeof value.value === "number") return true;
      if (typeof value.value === "boolean") return true;
      return false;
    });
  }

  public static classValue() {
    return z.object({
      target: n.class(),
      instance: z.object({}).optional(),
    });
  }

  public static containerValue() {
    return z.union([n.classValue(), n.constantValue()]);
  }

  /**
   * Check if the value is empty
   *
   * - If the value is `null` or `undefined`, it returns `true`.
   * - If the value is a string and it is an empty string, it returns `true`.
   * - If the value is a string and it is a string with only spaces, it returns `true`.
   * - If the value is an pure object and it has no keys, it returns `true`.
   * - If the value is an array and it has no elements, it returns `true`.
   * - Otherwise, it returns `false`.
   *
   * @static
   * @param {unknown} v - pre check value
   * @return {boolean}
   * @memberof n
   */
  public static isEmpty(v: unknown): boolean {
    if (v === null) return true;
    if (v === undefined) return true;
    if (typeof v === "string" && v.trim() === "") return true;
    if (typeof v === "string" && v.length === 0) return true;
    if (typeof v === "object" && Object.keys(v).length === 0) return true;
    if (Array.isArray(v) && v.length === 0) return true;
    return false;
  }
}
