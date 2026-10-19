import { describe, expect, it } from "vitest";
import {
  LEGAL_BASIS,
  PLATE_LETTERS,
  REGIONS,
  classify,
  type Classification,
} from "../../src/bg/index.js";

// Every plate here is invented to fit a format. None comes from a database:
// a real plate belongs to a person (see test/normalize.test.ts).

const SOFIA_CITY = { name: "София (столица)", nameEn: "Sofia City" };

/** The 14 Latin capitals that are not among the twelve plate letters. */
const OTHER_LATIN = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].filter((l) => !PLATE_LETTERS.includes(l));

function kindOf(raw: string): string {
  const result = classify(raw);
  return result.status === "recognised" ? result.kind : result.status;
}

describe("classify: regular plates (Наредба № I-45, чл. 24, ал. 1)", () => {
  it("reads region code, four digits and series, and names the region", () => {
    expect(classify("СА 1234 ВХ")).toEqual({
      status: "recognised",
      country: "BG",
      kind: "regular",
      plate: "CA1234BX",
      display: "CA 1234 BX",
      basis: LEGAL_BASIS.regular,
      code: "CA",
      region: SOFIA_CITY,
      number: "1234",
      series: "BX",
    });
  });

  it.each([
    ["a one-letter code and a two-letter series", "P 0001 AB", "P", "0001", "AB"],
    ["a two-letter code and a one-letter series", "PB 9999 A", "PB", "9999", "A"],
    ["a one-letter code and a one-letter series", "X 1000 K", "X", "1000", "K"],
    ["a two-letter code and a two-letter series", "CO 0000 MT", "CO", "0000", "MT"],
  ])("reads %s", (_, raw, code, number, series) => {
    expect(classify(raw)).toMatchObject({ kind: "regular", code, number, series });
  });

  it.each(Object.keys(REGIONS))("knows the region code %s", (code) => {
    expect(classify(`${code}1234AB`)).toMatchObject({
      kind: "regular",
      code,
      region: REGIONS[code as keyof typeof REGIONS],
    });
  });

  it.each([...PLATE_LETTERS].filter((l) => l !== "E"))(
    "takes %s as the first letter of a series",
    (letter) => {
      expect(classify(`CA1234${letter}`)).toMatchObject({ kind: "regular", series: letter });
    },
  );

  it.each([...PLATE_LETTERS])("takes %s as the second letter of a series", (letter) => {
    expect(classify(`CA1234A${letter}`)).toMatchObject({ kind: "regular", series: `A${letter}` });
  });

  it.each(OTHER_LATIN)("does not take %s, which no plate has, in a series", (letter) => {
    expect(kindOf(`CA1234A${letter}`)).toBe("unrecognised");
    expect(kindOf(`CA1234${letter}`)).toBe("unrecognised");
  });

  it.each(OTHER_LATIN)("does not take %s, which no plate has, in a code", (letter) => {
    expect(kindOf(`${letter}1234AB`)).toBe("unrecognised");
    expect(kindOf(`C${letter}1234AB`)).toBe("unrecognised");
  });

  it("does not take a code no region has: the founder's „AA1234GG“ and its cousins", () => {
    expect(kindOf("AA1234GG")).toBe("unrecognised");
    expect(kindOf("AA1234AB")).toBe("unrecognised");
    expect(kindOf("KK1234AB")).toBe("unrecognised");
  });

  it.each([
    ["three letters before the digits", "CAB1234AB"],
    ["three letters after the digits", "CA1234ABC"],
    ["one digit", "CA1AB"],
    ["five digits and a two-letter series", "CA12345AB"],
    ["no series", "CA1234"],
    ["no code", "1234AB"],
    ["a digit before the code", "1CA1234AB"],
    ["a digit inside the code", "C1C1234AB"],
    ["a letter between the digits", "CA12A34AB"],
    ["a dot inside", "CA1234.AB"],
  ])("does not read %s as regular", (_, raw) => {
    expect(kindOf(raw)).toBe("unrecognised");
  });
});

describe("classify: trailers (series beginning with Е)", () => {
  it("reads a regular plate with a series that begins with Е as a trailer", () => {
    expect(classify("ЕВ 1234 ЕН")).toEqual({
      status: "recognised",
      country: "BG",
      kind: "trailer",
      plate: "EB1234EH",
      display: "EB 1234 EH",
      basis: LEGAL_BASIS.trailer,
      code: "EB",
      region: { name: "Габрово", nameEn: "Gabrovo" },
      number: "1234",
      series: "EH",
    });
  });

  it("reads a one-letter Е series as a trailer too", () => {
    expect(classify("CA1234E")).toMatchObject({ kind: "trailer", series: "E" });
  });

  it("does not read a series with Е only second as a trailer", () => {
    expect(classify("CA1234AE")).toMatchObject({ kind: "regular", series: "AE" });
  });

  it("does not read Благоевград's code Е as a trailer: only the series counts", () => {
    expect(classify("E1234AB")).toMatchObject({ kind: "regular", code: "E" });
  });
});

describe("classify: electric plates (Наредба № I-45, чл. 23, ал. 4)", () => {
  it("reads ЕА, the electric car's code in place of a region", () => {
    expect(classify("ЕА 1234 ВК")).toEqual({
      status: "recognised",
      country: "BG",
      kind: "electric",
      plate: "EA1234BK",
      display: "EA 1234 BK",
      basis: LEGAL_BASIS.electric,
      code: "EA",
      number: "1234",
      series: "BK",
    });
  });

  it("reads ЕМ, the electric motorcycle's code", () => {
    expect(classify("EM 0001 A")).toMatchObject({
      kind: "electric",
      code: "EM",
      number: "0001",
      series: "A",
      display: "EM 0001 A",
    });
  });

  it("reads an Е series after ЕА as electric, not as a trailer", () => {
    expect(classify("EA1234EB")).toMatchObject({ kind: "electric", series: "EB" });
  });

  it("does not take another code beginning with Е as electric", () => {
    expect(kindOf("EK1234AB")).toBe("unrecognised");
  });
});

describe("classify: personalised plates (Наредба № I-45, чл. 24, ал. 6–8)", () => {
  it("reads a region code and six characters of the owner's choice", () => {
    expect(classify("СА МОТОР1")).toEqual({
      status: "recognised",
      country: "BG",
      kind: "personalised",
      plate: "CAMOTOP1",
      display: "CA MOTOP1",
      basis: LEGAL_BASIS.personalised,
      code: "CA",
      region: SOFIA_CITY,
      text: "MOTOP1",
    });
  });

  it("reads six digits as personalised: МВР shows „ЕВ 111666“ as its example", () => {
    expect(classify("EB 111666")).toMatchObject({
      kind: "personalised",
      code: "EB",
      text: "111666",
    });
  });

  it("reads six letters as personalised", () => {
    expect(classify("PB AXTOMK")).toMatchObject({
      kind: "personalised",
      code: "PB",
      text: "AXTOMK",
    });
  });

  it("takes the code's length from the plate's: six characters always follow it", () => {
    expect(classify("C123456")).toMatchObject({ kind: "personalised", code: "C", text: "123456" });
    expect(classify("CO123456")).toMatchObject({
      kind: "personalised",
      code: "CO",
      text: "123456",
    });
  });

  it("prefers the regular reading when a plate fits both", () => {
    expect(classify("C1234AB")).toMatchObject({ kind: "regular", code: "C", series: "AB" });
    expect(classify("CA1234B")).toMatchObject({ kind: "regular", code: "CA", series: "B" });
  });

  it("reads a plate one character short of a two-letter code's six by the one-letter code", () => {
    // „CA12345“ is not СА and five characters; it is С and the six „A12345“.
    expect(classify("CA12345")).toMatchObject({ kind: "personalised", code: "C", text: "A12345" });
  });

  it.each([
    ["five characters after a code with no one-letter reading", "OB12345"],
    ["seven characters", "CA1234567"],
    ["a code no region has", "AA123456"],
    ["a letter no plate has", "CA12345G"],
    ["a dot among the six", "CA1234.5"],
    ["a dot as the last of the six", "CA12345."],
    ["a dot as the first of the six", "CA.12345"],
    ["a digit in the code", "C1123456"],
  ])("does not read %s as personalised", (_, raw) => {
    expect(kindOf(raw)).toBe("unrecognised");
  });
});

describe("classify: transit plates (Наредба № I-45, чл. 29, ал. 3)", () => {
  it.each([
    ["T", "123 Т 456"],
    ["H", "123 Н 456"],
    ["M", "123 М 456"],
  ])("reads six digits either side of %s", (letter, raw) => {
    expect(classify(raw)).toEqual({
      status: "recognised",
      country: "BG",
      kind: "transit",
      plate: `123${letter}456`,
      display: `123 ${letter} 456`,
      basis: LEGAL_BASIS.transit,
      letter,
      before: "123",
      after: "456",
      categoryL: false,
    });
  });

  it("reads five digits around М as a category L transit plate, two before and three after", () => {
    expect(classify("85 М 528")).toEqual({
      status: "recognised",
      country: "BG",
      kind: "transit",
      plate: "85M528",
      display: "85 M 528",
      basis: LEGAL_BASIS.transit,
      letter: "M",
      before: "85",
      after: "528",
      categoryL: true,
    });
  });

  it.each([
    ["five digits around Т: category L uses only М", "12T345"],
    ["five digits around Н", "12H345"],
    ["three digits before and two after", "123M45"],
    ["four digits before", "1234T567"],
    ["four digits after", "123T4567"],
    ["another letter", "123K456"],
    ["two letters", "123TT456"],
    ["a letter before", "A123T456"],
    ["a letter after", "123T456A"],
  ])("does not read %s as transit", (_, raw) => {
    expect(kindOf(raw)).not.toBe("transit");
  });
});

describe("classify: dealer plates (Наредба № I-45, чл. 30, ал. 2)", () => {
  it("reads six digits either side of В", () => {
    expect(classify("198 В 229")).toEqual({
      status: "recognised",
      country: "BG",
      kind: "dealer",
      plate: "198B229",
      display: "198 B 229",
      basis: LEGAL_BASIS.dealer,
      before: "198",
      after: "229",
      categoryL: false,
    });
  });

  it("reads five digits around В as a category L dealer plate", () => {
    expect(classify("85В528")).toMatchObject({
      kind: "dealer",
      display: "85 B 528",
      before: "85",
      after: "528",
      categoryL: true,
    });
  });

  it.each([
    ["one digit before", "1B234"],
    ["four digits before", "1234B567"],
    ["two digits after", "123B45"],
    ["four digits after", "123B4567"],
    ["a letter before", "A123B456"],
    ["a letter after", "123B456A"],
  ])("does not read %s as a dealer plate", (_, raw) => {
    expect(kindOf(raw)).not.toBe("dealer");
  });
});

describe("classify: foreign residents' plates (Наредба № I-181, чл. 17, ал. 1, т. 2)", () => {
  it("reads ХХ and four digits", () => {
    expect(classify("ХХ 1234")).toEqual({
      status: "recognised",
      country: "BG",
      kind: "foreigner",
      plate: "XX1234",
      display: "XX 1234",
      basis: LEGAL_BASIS.foreigner,
      code: "XX",
      number: "1234",
    });
  });

  it("reads ХН and four digits, the second code added in 2019", () => {
    expect(classify("ХН 0042")).toMatchObject({
      kind: "foreigner",
      code: "XH",
      number: "0042",
      display: "XH 0042",
    });
  });

  it.each([
    ["three digits", "XX123"],
    ["another Х code", "XK1234"],
    ["five digits", "XX12345"],
    ["one Х", "X1234"],
    ["a letter before", "AXX1234"],
    ["a letter after", "XX1234A"],
  ])("does not read %s as a foreign resident's plate", (_, raw) => {
    expect(kindOf(raw)).not.toBe("foreigner");
  });
});

describe("classify: military plates", () => {
  it("reads ВА and six digits", () => {
    expect(classify("ВА 123456")).toEqual({
      status: "recognised",
      country: "BG",
      kind: "military",
      plate: "BA123456",
      display: "BA 123456",
      basis: LEGAL_BASIS.military,
      code: "BA",
      number: "123456",
    });
  });

  it.each([
    ["five digits", "BA12345"],
    ["seven digits", "BA1234567"],
    ["a letter before", "ABA123456"],
    ["a letter after", "BA123456A"],
  ])("does not read %s as military", (_, raw) => {
    expect(kindOf(raw)).not.toBe("military");
  });
});

describe("classify: diplomatic plates (Наредба № I-181, чл. 17)", () => {
  it.each([
    ["С", "C", "diplomatic"],
    ["СС", "CC", "consular"],
    ["СТ", "CT", "staff"],
  ])("reads %s and four digits, and names who holds it", (cyrillic, code, holder) => {
    expect(classify(`${cyrillic} 1234`)).toEqual({
      status: "recognised",
      country: "BG",
      kind: "diplomatic",
      plate: `${code}1234`,
      display: `${code} 1234`,
      basis: LEGAL_BASIS.diplomatic,
      code,
      holder,
      number: "1234",
    });
  });

  it("tells a consular plate from Силистра's, whose code is also СС, by the series", () => {
    expect(classify("CC1234")).toMatchObject({ kind: "diplomatic", code: "CC" });
    expect(classify("CC1234AB")).toMatchObject({ kind: "regular", code: "CC" });
  });

  it.each([
    ["three digits", "C123"],
    ["five digits", "CT12345"],
    ["another С code", "CA1234"],
    ["a letter before", "ACC1234"],
  ])("does not read %s as diplomatic", (_, raw) => {
    expect(kindOf(raw)).not.toBe("diplomatic");
  });
});

describe("classify: what is not a Bulgarian format", () => {
  it.each([
    ["a German-looking plate", "B-XY 123"],
    ["a long run of digits", "12345678901"],
    ["a single letter", "A"],
    ["Greek letters", "ΑΒΕ1234"],
  ])("answers unrecognised for %s, with the normalised plate to show", (_, raw) => {
    const result = classify(raw);
    expect(result.status).toBe("unrecognised");
    expect(result.plate).toBe(result.display);
  });

  it("answers exactly status, plate and display for an unrecognised plate", () => {
    expect(classify("b-xy 123")).toEqual({
      status: "unrecognised",
      plate: "BXY123",
      display: "BXY123",
    });
  });
});

describe("classify: refusals come from check", () => {
  it("answers invalid and empty for a blank or dash-only plate", () => {
    const expected: Classification = { status: "invalid", reason: "empty", plate: "", display: "" };
    expect(classify("")).toEqual(expected);
    expect(classify(" — ")).toEqual(expected);
  });

  it("answers invalid with the letters for a plate no plate can be", () => {
    expect(classify("СА 1234 БВ")).toEqual({
      status: "invalid",
      reason: "impossible-characters",
      plate: "CA1234БB",
      display: "CA1234БB",
      characters: ["Б"],
    });
  });
});

describe("LEGAL_BASIS", () => {
  it("names a provision for every kind", () => {
    expect(Object.keys(LEGAL_BASIS).sort()).toEqual(
      [
        "dealer",
        "diplomatic",
        "electric",
        "foreigner",
        "military",
        "personalised",
        "regular",
        "trailer",
        "transit",
      ].sort(),
    );
  });

  it("cannot be changed by a caller", () => {
    expect(Object.isFrozen(LEGAL_BASIS)).toBe(true);
  });
});
