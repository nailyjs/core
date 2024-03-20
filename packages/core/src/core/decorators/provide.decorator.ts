import { NailyConstant, ScopeEnum } from "@/constant";
import { createClassDecorator } from "@/core/build";
import { n } from "@/schema/common.schema";
import { z } from "zod";

export const IProvideOptionsSchema = <Instance>(defaultToken: n.IToken<Instance>) => {
  return z.object({
    scope: z.nativeEnum(ScopeEnum).default(ScopeEnum.Singleton),
    token: n.token<Instance>().catch((e) => {
      if (!e.input) return defaultToken;
      throw e.error;
    }),
  });
};
export type IProvideOptions = z.infer<ReturnType<typeof IProvideOptionsSchema>>;

export function Provide(provideOptions: IProvideOptions) {
  return createClassDecorator({
    build(target) {
      const parsedOptions = IProvideOptionsSchema(target).parse(provideOptions);
      this.setMetadata(NailyConstant.Provide, parsedOptions);
    },
  });
}
