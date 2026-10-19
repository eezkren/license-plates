import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  CYRILLIC_TO_LATIN,
  PLATE_LETTERS,
  REGIONS,
  check,
  classify,
  format,
  normalize,
  type PlateKind,
} from "../src/index.js";

// Properties over generated input. The plates generated here are as invented
// as the hand-written ones: random combinations in a valid format.

const LATIN_TO_CYRILLIC = Object.fromEntries(
  Object.entries(CYRILLIC_TO_LATIN).map(([cyrillic, latin]) => [latin, cyrillic]),
);

const letter = fc.constantFrom(...PLATE_LETTERS);
const digit = fc.constantFrom(..."0123456789");
const digits = (length: number) => fc.string({ unit: digit, minLength: length, maxLength: length });
const regionCode = fc.constantFrom(...Object.keys(REGIONS));
const series = fc.string({ unit: letter, minLength: 1, maxLength: 2 });

/** Each kind's plates, as they are printed: the display form. */
const PRINTED: Record<PlateKind, fc.Arbitrary<string>> = {
  regular: fc
    .tuple(
      regionCode,
      digits(4),
      series.filter((s) => !s.startsWith("E")),
    )
    .map((parts) => parts.join(" ")),
  trailer: fc
    .tuple(regionCode, digits(4), fc.string({ unit: letter, maxLength: 1 }))
    .map(([code, number, rest]) => `${code} ${number} E${rest}`),
  electric: fc
    .tuple(fc.constantFrom("EA", "EM"), digits(4), series)
    .map((parts) => parts.join(" ")),
  personalised: fc
    .tuple(regionCode, fc.string({ unit: fc.oneof(letter, digit), minLength: 6, maxLength: 6 }))
    // Six characters that begin with four digits, or after a one-letter code
    // with a letter and four digits, also read as code, number and series, and
    // that reading wins by design (see classify; its tests pin the precedence).
    // Such texts are left out here.
    .filter(([code, text]) => !(code.length === 1 ? /^[A-Z]?\d{4}/ : /^\d{4}/).test(text))
    .map((parts) => parts.join(" ")),
  transit: fc.oneof(
    fc.tuple(digits(3), fc.constantFrom("T", "H", "M"), digits(3)).map((parts) => parts.join(" ")),
    fc.tuple(digits(2), digits(3)).map(([before, after]) => `${before} M ${after}`),
  ),
  dealer: fc
    .tuple(fc.oneof(digits(3), digits(2)), digits(3))
    .map(([before, after]) => `${before} B ${after}`),
  foreigner: fc.tuple(fc.constantFrom("XX", "XH"), digits(4)).map((parts) => parts.join(" ")),
  military: digits(6).map((number) => `BA ${number}`),
  diplomatic: fc.tuple(fc.constantFrom("C", "CC", "CT"), digits(4)).map((parts) => parts.join(" ")),
};

/**
 * A printed plate as someone might type it: each letter in either alphabet and
 * either case, and the spaces replaced by any separator or none.
 */
function typedAs(printed: string): fc.Arbitrary<string> {
  return fc
    .tuple(
      fc.array(fc.nat(3), { minLength: printed.length, maxLength: printed.length }),
      fc.constantFrom("", " ", "  ", "-", "—", "−"),
    )
    .map(([choices, separator]) =>
      [...printed]
        .map((char, i) => {
          if (char === " ") return separator;
          const cyrillic = LATIN_TO_CYRILLIC[char] ?? char;
          return [char, char.toLowerCase(), cyrillic, cyrillic.toLowerCase()][choices[i] ?? 0];
        })
        .join(""),
    );
}

describe("properties", () => {
  it.each(Object.entries(PRINTED))(
    "reads every %s plate, however it is typed, as that kind and prints it back",
    (kind, printed) => {
      fc.assert(
        fc.property(
          printed.chain((shown) => fc.tuple(fc.constant(shown), typedAs(shown))),
          ([shown, typed]) => {
            const result = classify(typed);
            expect(result.status).toBe("bulgarian");
            expect(result.status === "bulgarian" && result.kind).toBe(kind);
            expect(result.display).toBe(shown);
            expect(format(typed)).toBe(shown);
          },
        ),
      );
    },
  );

  const anything = fc.string({ unit: "binary", maxLength: 12 });

  it("normalises idempotently", () => {
    fc.assert(
      fc.property(anything, (raw) => {
        expect(normalize(normalize(raw))).toBe(normalize(raw));
      }),
    );
  });

  it("classifies the normalised plate the same as the typed one", () => {
    fc.assert(
      fc.property(anything, (raw) => {
        expect(classify(raw)).toEqual(classify(normalize(raw)));
      }),
    );
  });

  it("formats to text that normalises back to the plate", () => {
    fc.assert(
      fc.property(anything, (raw) => {
        expect(normalize(format(raw))).toBe(normalize(raw));
      }),
    );
  });

  it("refuses exactly what check refuses, and recognises nothing it refuses", () => {
    fc.assert(
      fc.property(anything, (raw) => {
        expect(classify(raw).status === "invalid").toBe(!check(raw).ok);
      }),
    );
  });
});
