describe("ElementExistException", () => {
  test("Constant Exception", () => {
    // console.error(
    //   new ElementExistException({
    //     kind: "constant",
    //     target: undefined,
    //     tokens: ["T"],
    //     value: "test",
    //   }),
    // );
  });

  test("Class Exception", () => {
    // console.error(
    //   new ElementExistException({
    //     kind: "class",
    //     scope: ScopeEnum.Prototype,
    //     target: class T {},
    //     tokens: ["T"],
    //   }),
    // );
  });
});

test("TokenExistException", () => {
  // console.error(new TokenExistException("testToken", "testContext"));
});
