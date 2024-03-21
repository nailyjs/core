import { IProvideOptions, IProvideOptionsSchema, Provide } from "./provide.decorator";
import { ClassDecoratorContext } from "../build";
import { NailyConstant, ScopeEnum } from "@/constant";
import { ZodError } from "zod";

describe("Provide Decorator", () => {
  it("should be defined", () => {
    @Provide()
    class AppService {}

    const data = new ClassDecoratorContext(AppService).getMetadata<IProvideOptions>(NailyConstant.Provide);
    expect(data).toBeDefined();
    expect(data.scope).toBe(ScopeEnum.Singleton);
    expect(data.token).toBe(AppService);
  });

  it("should throw zod error", () => {
    expect(() => {
      IProvideOptionsSchema(class {}).parse(undefined);
    }).toThrowError(ZodError);
  });
});
