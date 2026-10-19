import { describe, expect, it } from "vitest";
import { normalize } from "../src/index.js";

// Every plate in this package's tests is invented. A real plate belongs to a
// real car and, through it, to a person: it is personal data and stays out of a
// public repository.

describe("normalize", () => {
  it("maps each of the twelve Cyrillic plate letters to the Latin letter it looks like", () => {
    expect(normalize("АВЕКМНОРСТУХ")).toBe("ABEKMHOPCTYX");
  });

  it("maps them in lower case too, because it upper-cases first", () => {
    expect(normalize("авекмнорстух")).toBe("ABEKMHOPCTYX");
  });

  it("stores a plate typed on a Bulgarian keyboard the same as one typed on a Latin one", () => {
    expect(normalize("СА 1234 ВХ")).toBe("CA1234BX");
    expect(normalize("CA 1234 BX")).toBe("CA1234BX");
  });

  it("upper-cases Latin letters", () => {
    expect(normalize("ca1234bx")).toBe("CA1234BX");
  });

  it("handles a plate typed half in Cyrillic, half in Latin, in lower case", () => {
    expect(normalize("сa 12 34 вx")).toBe("CA1234BX");
  });

  it.each([
    ["a space", "CA 1234 BX"],
    ["a tab and a newline", "CA\t1234\nBX"],
    ["a no-break space", "CA\u00a01234\u00a0BX"],
  ])("strips %s", (_, raw) => {
    expect(normalize(raw)).toBe("CA1234BX");
  });

  // Every dash a keyboard produces: ASCII, the Unicode hyphen, Word's
  // non-breaking hyphen, the figure dash, macOS and iOS smart dashes, the
  // horizontal bar, the minus sign (Sm, not Pd, so named on its own), the small
  // and fullwidth forms.
  const DASHES = [
    "-",
    "\u2010",
    "\u2011",
    "\u2012",
    "\u2013",
    "\u2014",
    "\u2015",
    "\u2212",
    "\ufe58",
    "\ufe63",
    "\uff0d",
  ];

  it.each(DASHES.map((dash) => [dash.charCodeAt(0).toString(16).padStart(4, "0"), dash]))(
    "strips the dash U+%s",
    (_, dash) => {
      expect(normalize(`CA${dash}1234${dash}BX`)).toBe("CA1234BX");
    },
  );

  it.each(["-", "\u2014", " \u2013 ", "\u2014\u2014", "\u2212"])(
    "normalises %j to nothing",
    (raw) => {
      expect(normalize(raw)).toBe("");
    },
  );

  it("keeps the letters around a dash: a foreign plate keeps its text", () => {
    expect(normalize("B-XY 123")).toBe("BXY123");
  });

  it("leaves a Cyrillic letter no plate has as it is, for check to refuse", () => {
    expect(normalize("ДОМ")).toBe("ДOM");
    expect(normalize("дом")).toBe("ДOM");
  });

  it("leaves a Latin letter outside the twelve as it is: a foreign plate may have it", () => {
    expect(normalize("AA1234GG")).toBe("AA1234GG");
  });

  it("leaves other characters alone: it strips separators, it does not judge", () => {
    expect(normalize("CA.1234")).toBe("CA.1234");
  });

  it("is idempotent", () => {
    expect(normalize(normalize("св 1234 ах"))).toBe(normalize("св 1234 ах"));
  });

  it("answers an empty string for an empty one", () => {
    expect(normalize("")).toBe("");
  });

  it("answers an empty string for null or undefined rather than throwing", () => {
    // Unreachable from TypeScript; pinned for plain JavaScript callers.
    expect(normalize(null as unknown as string)).toBe("");
    expect(normalize(undefined as unknown as string)).toBe("");
  });
});
