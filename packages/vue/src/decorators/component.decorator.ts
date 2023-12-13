import { NailyVueBuilder } from "../typings";
import { Bean, Type } from "@nailyjs/core";

export function Component() {
  return (target: Type<NailyVueBuilder>) => {
    Bean()(target);
  };
}
