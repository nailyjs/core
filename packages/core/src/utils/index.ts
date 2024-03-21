import { DesignType } from "@/core/build";

export function transformDesignType(value: unknown, designType: DesignType): unknown {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return new designType(value);
}
