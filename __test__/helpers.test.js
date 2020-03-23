const helpers = require("../utils/helpers");
const client = require("../utils/testMocks");

describe("helpers functions", () => {
  it("isThereAnyConnection", () => {
    expect(helpers.isThereAnyConnection(client)).toBe(false);
  });

  it("expects a random string with a defined length", () => {
    expect(helpers.generateRandomCode(7)).toHaveLength(7);
  });
});
