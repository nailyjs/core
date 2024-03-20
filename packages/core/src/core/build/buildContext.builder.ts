import { n } from "@/schema/common.schema";

export type DesignType =
  | String
  | Number
  | Boolean
  | Symbol
  | BigInt
  | Object
  | Function
  | Array<unknown>
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array
  | ArrayBuffer
  | SharedArrayBuffer
  | Atomics
  | DataView
  | WeakRef<WeakKey>
  | void
  | n.IType
  | Promise<unknown>
  | Date
  | RegExp
  | Map<unknown, unknown>
  | Set<unknown>
  | WeakMap<WeakKey, unknown>
  | WeakSet<WeakKey>
  | Error;

export interface IDecoratorBuilderContext {
  /**
   * ### Set metadata
   *
   * Set metadata to the target.
   *
   * @param {unknown} key
   * @param {unknown} value
   * @memberof IDecoratorBuilderContext
   */
  setMetadata(key: unknown, value: unknown): void;
  /**
   * ### Get metadata
   * 
   * Get metadata from the target.
   *

   * @template Value
   * @param {string} key
   * @return {Value}
   * @memberof IDecoratorBuilderContext
   */
  getMetadata(key: string): unknown | undefined;
  /**
   * ### Get prototype ownkeys
   *
   * Get prototype ownkeys from the target.
   *
   * @return {((string | symbol)[])}
   * @memberof IDecoratorBuilderContext
   */
  getPrototypeOwnkeys(): (string | symbol)[];
  /**
   * ### Get static ownkeys
   *
   * Get static ownkeys from the target.
   *
   * @return {((string | symbol)[])}
   * @memberof IDecoratorBuilderContext
   */
  getStaticOwnkeys(): (string | symbol)[];
}

export interface IClassDecoratorBuilderContext extends IDecoratorBuilderContext {
  /**
   * ### Get paramtypes
   *
   * Get paramtypes from the target.
   *
   * @return {unknown[]}
   * @memberof IClassDecoratorBuilderContext
   */
  getParamtypes(): DesignType[];
}

export interface IPropertyDecoratorBuilderContext extends IDecoratorBuilderContext {
  /**
   * ### Get design type
   *
   * Get design type from the target's property.
   *
   * @return {unknown}
   * @memberof IIPropertyDecoratorBuilderContext
   */
  getDesignType(): DesignType;
}

export interface IParamDecoratorBuilderContext extends IPropertyDecoratorBuilderContext {
  /**
   * ### Get metadata by index
   *
   * Get metadata from the target by index.
   *
   * @template Value
   * @param {unknown} key
   * @param {number} index
   * @return {(Value | undefined)}
   * @memberof IParamDecoratorBuilderContext
   */
  getMetadataByIndex(key: unknown, index: number): unknown | undefined;
  /**
   * ### Get metadata by property key
   *
   * Get metadata from the target by property key.
   *
   * @template Value
   * @param {unknown} key
   * @param {(string | symbol)} propertyKey
   * @return {(unknown | undefined)}
   * @memberof IParamDecoratorBuilderContext
   */
  getMetadataByPropertyKey(key: unknown, propertyKey: string | symbol): unknown | undefined;
  /**
   * ### Get metadata by index and property key
   *
   * Get metadata from the target by index and property key.
   *
   * @param {unknown} key
   * @param {number} index
   * @param {(string | symbol)} propertyKey
   * @return {(unknown | undefined)}
   * @memberof IParamDecoratorBuilderContext
   */
  getMetadataByIndexAndPropertyKey(key: unknown, index: number, propertyKey: string | symbol): unknown | undefined;
  /**
   * ### Get design type
   *
   * Get design type from the target's parameter.
   *
   * @return {DesignType}
   * @memberof IParamDecoratorBuilderContext
   */
  getDesignType(): DesignType;
}
