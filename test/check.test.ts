import { describe, expect, it } from "vitest";
import { check, MAX_PLATE_LENGTH } from "../src/index.js";

describe("check", () => {
  it("answers the normalised plate for a plate", () => {
    expect(check("СА 1234 ВХ")).toEqual({ ok: true, plate: "CA1234BX" });
    expect(check("ca-1234-bx")).toEqual({ ok: true, plate: "CA1234BX" });
  });

  it.each(["АВЕКМНОРСТУХ", "авекмнорстух", "ABEKMHOPCTYX", "abekmhopctyx", "АbЕkМhОpСtУx"])(
    "passes all twelve plate letters, typed as %s",
    (raw) => {
      expect(check(raw)).toEqual({ ok: true, plate: "ABEKMHOPCTYX" });
    },
  );

  it.each(["", "   ", "-", "—", " – ", "\t\n"])("refuses %j as empty", (raw) => {
    expect(check(raw)).toEqual({ ok: false, reason: "empty", plate: "" });
  });

  it("refuses null and undefined as empty rather than throwing", () => {
    expect(check(null as unknown as string)).toEqual({ ok: false, reason: "empty", plate: "" });
    expect(check(undefined as unknown as string)).toEqual({
      ok: false,
      reason: "empty",
      plate: "",
    });
  });

  // The Bulgarian letters outside the twelve. A Bulgarian plate carries only
  // А В Е К М Н О Р С Т У Х (МВР's rule since 1992 for codes and series;
  // Наредба № I-45, чл. 24, ал. 7 for the personalised six), so any of these
  // makes it no plate this package can read.
  it.each([
    "Б",
    "Г",
    "Д",
    "Ж",
    "З",
    "И",
    "Й",
    "Л",
    "П",
    "Ф",
    "Ц",
    "Ч",
    "Ш",
    "Щ",
    "Ъ",
    "Ь",
    "Ю",
    "Я",
  ])("refuses a plate carrying %s and names the letter", (letter) => {
    expect(check(`CA1234${letter}B`)).toEqual({
      ok: false,
      reason: "impossible-characters",
      plate: `CA1234${letter}B`,
      characters: [letter],
    });
  });

  it.each(["Ё", "Ы", "Э", "І", "Ј", "Ї", "Ў"])(
    "refuses %s too: the rule is any Cyrillic letter left, as in MotoManager, not a list of Bulgarian ones",
    (letter) => {
      expect(check(`CA1234${letter}B`)).toMatchObject({
        ok: false,
        reason: "impossible-characters",
      });
    },
  );

  it("names each impossible letter once, in the order it first appears", () => {
    expect(check("ЖЖ 1234 ЮЖ")).toEqual({
      ok: false,
      reason: "impossible-characters",
      plate: "ЖЖ1234ЮЖ",
      characters: ["Ж", "Ю"],
    });
  });

  it("names a lower-case letter in the upper case it was stored in", () => {
    expect(check("ca 1234 bд")).toMatchObject({ characters: ["Д"] });
  });

  it("answers the same for the same input on every call", () => {
    // The pattern is global. A global regex used with `.test()` alternates
    // true and false for the same input; this pins that it is not used so.
    const first = check("ДOM");
    const second = check("ДOM");
    expect(second).toEqual(first);
    expect(second.ok).toBe(false);
  });

  it("passes a plate in Latin letters outside the twelve: it may be foreign", () => {
    expect(check("B-XY 123")).toEqual({ ok: true, plate: "BXY123" });
    expect(check("AA1234GG")).toEqual({ ok: true, plate: "AA1234GG" });
  });

  it("passes a plate whose format nobody recognises: that is a warning, not a refusal", () => {
    expect(check("12345678901")).toEqual({ ok: true, plate: "12345678901" });
  });

  it("is twelve characters long at most", () => {
    expect(MAX_PLATE_LENGTH).toBe(12);
  });

  it.each([
    ["the longest Irish plate", "132-DL-123456", "132DL123456"],
    ["a German historic plate", "M-AB 1234H", "MAB1234H"],
    ["twelve characters", "AB12-CD34-EF56", "AB12CD34EF56"],
  ])("passes %s", (_, raw, plate) => {
    expect(check(raw)).toEqual({ ok: true, plate });
  });

  it("counts the length after normalising, so separators do not count", () => {
    expect(check(" A-B-C-D-E-F-G-H-I-J-K-L ")).toEqual({ ok: true, plate: "ABCDEFGHIJKL" });
  });

  it("refuses thirteen characters as too long", () => {
    expect(check("AB12CD34EF56G")).toEqual({
      ok: false,
      reason: "too-long",
      plate: "AB12CD34EF56G",
    });
  });

  it("refuses a pasted wall of text as too long", () => {
    const plate = "CA1234AB".repeat(250);
    expect(check(plate)).toEqual({ ok: false, reason: "too-long", plate });
  });

  it("counts an upper case that grows the plate: ß becomes SS", () => {
    expect(check("ßßßßßßß")).toEqual({ ok: false, reason: "too-long", plate: "SS".repeat(7) });
  });

  it("refuses a plate too long before naming its impossible letters", () => {
    expect(check("CA1234БB".repeat(2))).toEqual({
      ok: false,
      reason: "too-long",
      plate: "CA1234БB".repeat(2),
    });
  });
});
