const { isThereAnyConnection } = require("../utils/helpers");
const client = require("../utils/testMocks");

describe("helpers functions", () => {
  it("isThereAnyConnection", () => {
    expect(isThereAnyConnection(client)).toBe(false);
  });
});
