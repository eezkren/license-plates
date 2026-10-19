import { describe, expect, it } from "vitest";
import { format } from "../../src/bg/index.js";

describe("bg.format", () => {
  it("spaces a Bulgarian plate the way it is printed", () => {
    expect(format("са1234вх")).toBe("CA 1234 BX");
    expect(format("85м528")).toBe("85 M 528");
  });

  it("shows anything else normalised", () => {
    expect(format("b-xy 123")).toBe("BXY123");
    expect(format("—")).toBe("");
  });
});
