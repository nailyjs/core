import { n } from "@/schema/common.schema";
import { ClassDecoratorContext, ParamDecoratorContext, PropertyDecoratorContext } from "../build";
import { NailyClassFactory } from "./factory.ctx";
import { ImplNailyPlugin } from "@/typings";

export namespace NailyContext {
  export namespace IElement {
    export interface IClassElement<Instance> {
      type: "class";
      target: n.IType<Instance>;
      instance?: Instance;
    }
    export interface IConstantElement<Value> {
      type: "constant";
      value: Value;
    }
  }
  export type IElement<T = unknown> = IElement.IClassElement<T> | IElement.IConstantElement<T>;
}

export abstract class NailyContext {
  private readonly _contextPlugins = new Set<ImplNailyPlugin | n.IType<ImplNailyPlugin>>();
  private readonly _contextContainer = new Map<n.IToken, NailyContext.IElement>();

  /**
   * ### Class Context ⁿᵃⁱ
   *
   * Create a class context for a given class
   *
   * @template Instance
   * @param {n.IType<Instance>} target
   * @memberof NailContext
   */
  public createClassContext<Instance>(target: n.IType<Instance>) {
    return new ClassDecoratorContext(target);
  }

  /**
   * ### Property Context ⁿᵃⁱ
   *
   * Create a property context for a given class.
   *
   * @template Instance
   * @param {n.IType<Instance>} target
   * @param {(string | symbol)} propertyKey
   * @memberof NailContext
   */
  public createPropertyContext<Instance>(target: n.IType<Instance>, propertyKey: string | symbol) {
    return new PropertyDecoratorContext(target, propertyKey);
  }

  /**
   * ### Parameter Context ⁿᵃⁱ
   *
   * Create a parameter context for a given class.
   *
   * @template Instance
   * @param {n.IType<Instance>} target
   * @param {(string | symbol)} propertyKey
   * @param {number} parameterIndex
   * @memberof NailContext
   */
  public createParameterContext<Instance>(target: n.IType<Instance>, propertyKey: string | symbol, parameterIndex: number) {
    return new ParamDecoratorContext(target, propertyKey, parameterIndex);
  }

  /**
   * ### Property Parameter Context ⁿᵃⁱ
   *
   * Create a property parameter context for a given class.
   *
   * @template Instance
   * @param {n.IType<Instance>} target
   * @param {(string | symbol)} propertyKey
   * @param {number} parameterIndex
   * @memberof NailContext
   */
  public createPropertyParameterContext<Instance>(target: n.IType<Instance>, propertyKey: string | symbol, parameterIndex: number) {
    return new ParamDecoratorContext(target, propertyKey, parameterIndex);
  }

  /**
   * ### Class Factory ⁿᵃⁱ
   *
   * Create a class factory for a given class.
   *
   * @template Instance - The class instance
   * @param {n.IType<Instance>} target - The class type
   * @memberof NailyContext
   */
  public createClassFactory<Instance>(target: n.IType<Instance>) {
    return new NailyClassFactory(target, this, Array.from(this._contextPlugins));
  }

  /**
   * ### Use Naily Plugin ⁿᵃⁱ
   *
   * Use a naily plugin in the current context.
   *
   * @param {(ImplNailyPlugin | n.IType<ImplNailyPlugin>)} plugin
   * @return {this}
   * @memberof NailyContext
   */
  public useNailyPlugin(plugin: ImplNailyPlugin | n.IType<ImplNailyPlugin>): this {
    this._contextPlugins.add(plugin);
    return this;
  }
}

export class TestModule {}
