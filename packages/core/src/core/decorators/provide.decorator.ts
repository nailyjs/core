import { NailyConstant, ScopeEnum } from "@/constant";
import { createClassDecorator } from "@/core/build";
import { n } from "@/schema/common.schema";
import { ZodError, z } from "zod";

export const IProvideOptionsSchema = <Instance>(defaultToken: n.IToken<Instance>) => {
  return z.object({
    scope: z.nativeEnum(ScopeEnum).default(ScopeEnum.Singleton),
    token: n.token<Instance>().catch((e: { error: ZodError; input: unknown }) => {
      if (!e.input) return defaultToken;
      throw e.error;
    }),
  });
};
export type IProvideOptions = z.infer<ReturnType<typeof IProvideOptionsSchema>>;

/**
 * ### Provide decorator ⁿᵃⁱ
 *
 * The `@Provide` decorator is used to define a provider for a class.
 *
 * @export
 * @param {IProvideOptions} provideOptions The options for the provider
 */
export function Provide(provideOptions: IProvideOptions = {}) {
  return createClassDecorator({
    build(target) {
      const parsedOptions = IProvideOptionsSchema(target).parse(provideOptions);
      this.setMetadata(NailyConstant.Provide, parsedOptions);
    },
  });
}
