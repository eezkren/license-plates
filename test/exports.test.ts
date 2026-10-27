import { describe, expect, it } from "vitest";
import * as root from "../src/index.js";
import * as bg from "../src/bg/index.js";

// The public surface of each entry point, pinned so that adding or removing an
// export is a visible decision in review, not a side effect.

describe("exports", () => {
  it("of license-plates", () => {
    expect(Object.keys(root).sort()).toEqual(
      [
        "COUNTRIES",
        "CYRILLIC_TO_LATIN",
        "MAX_PLATE_LENGTH",
        "bg",
        "check",
        "classify",
        "format",
        "normalize",
      ].sort(),
    );
  });

  it("of license-plates/bg", () => {
    expect(Object.keys(bg).sort()).toEqual(
      [
        "LEGAL_BASIS",
        "MAX_PLATE_LENGTH",
        "PLATE_LETTERS",
        "REGIONS",
        "check",
        "classify",
        "format",
        "isRegionCode",
        "normalize",
      ].sort(),
    );
  });

  it("shares one normalize and one check between the entries", () => {
    expect(bg.normalize).toBe(root.normalize);
    expect(bg.check).toBe(root.check);
    expect(root.bg.classify).toBe(bg.classify);
  });
});
