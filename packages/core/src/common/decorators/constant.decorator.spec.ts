import { IElement } from "@/typings";
import { NailyGlobalContext } from "../contexts/global.ctx";
import { Constant } from "./constant.decorator";

describe("Constant Decorator", () => {
  it("should return the constant value", () => {
    @Constant("test", "value")
    class TestService {}
    new TestService();

    @Constant(["tests"], "value")
    class TestService2 {}
    new TestService2();

    /* [INFO] 工厂端 */

    const constant = NailyGlobalContext.getElementByToken<IElement.IConstantElement>("test");
    expect(constant).toBeDefined();
    expect(constant.value).toBe("value");
    expect(constant.target).toBe(TestService);
    expect(constant.tokens).toEqual(["test"]);
  });

  it("should throw an error if the constant key already exists in container", () => {
    @Constant("test2", "value")
    class TestService {}
    new TestService();

    expect(() => {
      @Constant("test2", "value")
      class TestService2 {}
      new TestService2();
    }).toThrowError();
  });
});
