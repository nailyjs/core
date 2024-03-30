import "@nailyjs/babel-plugin-reflection/stage3";
import { ZodError, z } from "zod";
import { IToken, IType, token } from "../schemas";
import { NailyGlobalContext } from "../contexts/global.ctx";
import { ScopeEnum } from "../constants";

export function ProvideOptionsSchema(defaultToken: IToken) {
  return z.object({
    tokens: token().or(
      z.array(token()).catch((e: { error: ZodError; input: unknown }) => {
        if (!e.input) return [defaultToken];
        throw e.error;
      }),
    ),
    scope: z.nativeEnum(ScopeEnum).default(ScopeEnum.Singleton),
  });
}
export interface IProvideOptions extends z.infer<ReturnType<typeof ProvideOptionsSchema>> {}

export const ProvideSymbol = Symbol("Provide");
export function Provide(provideOptions: IProvideOptions = {}) {
  return (target: IType, ctx: ClassDecoratorContext) => {
    const parsedProvideOptions = ProvideOptionsSchema(target).parse(provideOptions);
    if (ctx.kind === "class") {
      const status = NailyGlobalContext.add({
        kind: ctx.kind,
        scope: parsedProvideOptions.scope,
        target,
        tokens: Array.isArray(parsedProvideOptions.tokens) ? parsedProvideOptions.tokens : [parsedProvideOptions.tokens],
      });
      if (status !== "DONE") throw status;
    }
  };
}
