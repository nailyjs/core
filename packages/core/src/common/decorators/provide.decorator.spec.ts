import { NailyGlobalContext } from "../contexts/global.ctx";
import { TokenExistException } from "../errors/context/TokenExist.exception";
import { Provide } from "./provide.decorator";

describe("Provide Decorator", () => {
  it("should be defined", () => {
    @Provide()
    class TestService {}
    new TestService();

    @Provide({ tokens: ["TestService2"] })
    class TestService2 {}
    new TestService2();

    /* [INFO] 工厂端 */

    const element = NailyGlobalContext.getElementByToken(TestService);
    expect(element.kind).toBe("class");
    expect(element.target).toBe(TestService);
  });

  it("should throw an error if the constant key already exists in container", () => {
    @Provide()
    class TestService {}
    new TestService();

    expect(() => {
      @Provide({ tokens: [TestService] })
      class TestService2 {}
      new TestService2();
    }).toThrow(TokenExistException);
  });
});
