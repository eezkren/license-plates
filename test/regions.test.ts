import { describe, expect, it } from "vitest";
import { CYRILLIC_TO_LATIN, PLATE_LETTERS, REGIONS, isRegionCode } from "../src/index.js";

describe("REGIONS", () => {
  it("has the 28 regions of Bulgaria, Sofia City under three codes", () => {
    const names = new Set(Object.values(REGIONS).map((region) => region.name));
    expect(names.size).toBe(28);
    expect(Object.keys(REGIONS)).toHaveLength(30);
    expect([REGIONS.C, REGIONS.CA, REGIONS.CB].every((r) => r.name === "София (столица)")).toBe(
      true,
    );
  });

  it("writes every code in the twelve plate letters only", () => {
    for (const code of Object.keys(REGIONS)) {
      expect([...code].every((letter) => PLATE_LETTERS.includes(letter))).toBe(true);
    }
  });

  it("cannot be changed by a caller", () => {
    expect(Object.isFrozen(REGIONS)).toBe(true);
  });
});

describe("isRegionCode", () => {
  it("knows a region's code", () => {
    expect(isRegionCode("PB")).toBe(true);
    expect(isRegionCode("C")).toBe(true);
  });

  it("does not know a code no region has, nor an inherited property name", () => {
    expect(isRegionCode("AA")).toBe(false);
    expect(isRegionCode("EA")).toBe(false);
    expect(isRegionCode("")).toBe(false);
    expect(isRegionCode("toString")).toBe(false);
    expect(isRegionCode("__proto__")).toBe(false);
  });
});

describe("the twelve plate letters", () => {
  it("are the same twelve in the map and in the list", () => {
    expect(Object.values(CYRILLIC_TO_LATIN).join("")).toBe(PLATE_LETTERS);
  });

  it("each map a Cyrillic capital to a Latin capital", () => {
    for (const [cyrillic, latin] of Object.entries(CYRILLIC_TO_LATIN)) {
      expect(cyrillic).toMatch(/^\p{Script=Cyrillic}$/u);
      expect(latin).toMatch(/^[A-Z]$/);
    }
  });

  it("cannot be changed by a caller", () => {
    expect(Object.isFrozen(CYRILLIC_TO_LATIN)).toBe(true);
  });
});
