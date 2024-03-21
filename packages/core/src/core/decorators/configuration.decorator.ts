import { z } from "zod";
import { createClassDecorator } from "../build";
import { n } from "@/schema/common.schema";
import { NailyConstant, ScopeEnum } from "@/constant";
import { Provide } from "./provide.decorator";

export const IConfigurationOptionsSchema = z.object({
  providers: z.array(n.token()).default([]),
});
export type IConfigurationOptions = z.infer<typeof IConfigurationOptionsSchema>;

function createConfigurationDecorator(configurationOptions: IConfigurationOptions = {}) {
  return createClassDecorator({
    build(target) {
      const value = this.getMetadata(NailyConstant.Provide);
      if (value) {
        throw new Error(`@Provide() is not allowed in @Configuration() in ${target.name}, because it's already a @Provide() singleton class.`);
      }
      Provide({ scope: ScopeEnum.Singleton })(target);
      this.setMetadata(NailyConstant.Configuration, configurationOptions);
    },
  });
}

export function Configuration(configurationOptions: IConfigurationOptions = {}) {
  return createConfigurationDecorator(configurationOptions);
}
