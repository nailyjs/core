import { IElement } from "@/typings";
import { TokenExistException } from "../errors/context/TokenExist.exception";
import { IToken } from "..";
import { ElementExistException } from "../errors/context/ElementExist.exception";

export abstract class NailyGlobalContext {
  private static readonly _elements = new Set<IElement>();

  public static add<I>(element: IElement<I>): "DONE" | TokenExistException | ElementExistException {
    if (this._elements.has(element)) return new ElementExistException(element);
    for (const token of element.tokens) {
      if (this.getElementByToken(token)) return new TokenExistException(token);
    }
    this._elements.add(element);
    return "DONE";
  }

  public static getElementByToken<Element extends IElement>(token: IToken): undefined | Element {
    for (const element of this._elements) {
      if (element.tokens.includes(token)) return element as Element;
    }
    return undefined;
  }
}
