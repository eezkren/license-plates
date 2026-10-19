import { describe, expect, it } from "vitest";
import { format } from "../../src/bg/index.js";

describe("bg.format", () => {
  it("spaces a Bulgarian plate the way it is printed", () => {
    expect(format("са1234вх")).toBe("CA 1234 BX");
    expect(format("47м316")).toBe("47 M 316");
  });

  it("shows anything else normalised", () => {
    expect(format("b-xy 123")).toBe("BXY123");
    expect(format("—")).toBe("");
  });
});
