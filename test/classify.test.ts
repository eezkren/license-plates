import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { COUNTRIES, bg, classify } from "../src/index.js";

// The country-neutral classify. Each country's own rules are tested in its
// folder (test/bg); this file tests how their answers are combined.

describe("classify (all countries)", () => {
  it("covers Bulgaria only, for now", () => {
    expect(COUNTRIES).toEqual(["BG"]);
    expect(Object.isFrozen(COUNTRIES)).toBe(true);
  });

  it("answers recognised with each country's reading, and the first one's display", () => {
    expect(classify("са 1234 вх")).toEqual({
      status: "recognised",
      plate: "CA1234BX",
      display: "CA 1234 BX",
      matches: [bg.classify("CA1234BX")],
    });
  });

  it("tags every reading with its country", () => {
    const result = classify("XX 1234");
    expect(result.status === "recognised" && result.matches.map((m) => m.country)).toEqual(["BG"]);
  });

  it("answers unrecognised when no country's format fits: a warning, not a refusal", () => {
    expect(classify("b-xy 123")).toEqual({
      status: "unrecognised",
      plate: "BXY123",
      display: "BXY123",
    });
  });

  it("answers invalid for what check refuses", () => {
    expect(classify(" - ")).toEqual({ status: "invalid", reason: "empty", plate: "", display: "" });
    expect(classify("са1234бв")).toEqual({
      status: "invalid",
      reason: "impossible-characters",
      plate: "CA1234БB",
      display: "CA1234БB",
      characters: ["Б"],
    });
    expect(classify("AB12CD34EF56G")).toEqual({
      status: "invalid",
      reason: "too-long",
      plate: "AB12CD34EF56G",
      display: "AB12CD34EF56G",
    });
  });

  it("agrees with the Bulgarian module on every input while Bulgaria is the only country", () => {
    fc.assert(
      fc.property(fc.string({ unit: "binary", maxLength: 12 }), (raw) => {
        const all = classify(raw);
        const bulgarian = bg.classify(raw);
        if (all.status === "recognised") {
          expect(all.matches).toEqual([bulgarian]);
          expect(all.display).toBe(bulgarian.display);
        } else {
          expect(all).toEqual(bulgarian);
        }
      }),
    );
  });
});
