let sum = (num1, num2) => num1 + num2;

describe("Practice Tests - Summing", () => {
  test("sum function add 1 + 2 to equal 3", () => {
    expect(sum(1, 2)).toBe(3);
  });

  test("sum function adds negatives correctly", () => {
    expect(sum(-4, 1)).toBe(-3);
  });

  //   test("sum function add 2 + 2 to equal 5", () => {
  //     expect(sum(2, 2)).toBe(5);
  //   });
});
