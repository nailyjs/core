import "@nailyjs/babel-plugin-reflection/stage3";
import { NailyGlobalContext } from "../contexts/global.ctx";
import { IToken, IType } from "../schemas";

export function Constant<Key extends IToken, Value>(tokens: Key | Key[], value: Value) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (target: undefined | IType, _ctx: DecoratorContext) => {
    const status = NailyGlobalContext.add({
      kind: "constant",
      target: target,
      value: value,
      tokens: Array.isArray(tokens) ? tokens : [tokens],
    });
    if (status !== "DONE") throw status;
  };
}
