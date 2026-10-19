import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { check, normalize } from "../src/index.js";

/**
 * MotoManager's plate rules before this package, restated as the reference the
 * package must match so MotoManager can swap its own code for it (MOTO-495).
 * Restated from MotoManager 0.7.161, `domain/shared/value-objects/
 * license-plate.ts` (`normalizeLicensePlate`, `checkPlate`) and `placeholder.ts`
 * (`stripPlaceholderChars`), on 2026-10-19. Written differently on purpose:
 * code-unit `split("")` and a per-character map, where the package uses one
 * regex replacement, so the two only agree if the behaviour does.
 */
const REFERENCE_MAP: Record<string, string> = {
  А: "A",
  В: "B",
  Е: "E",
  К: "K",
  М: "M",
  Н: "H",
  О: "O",
  Р: "P",
  С: "C",
  Т: "T",
  У: "Y",
  Х: "X",
};

function referenceNormalize(plate: string): string {
  if (!plate) return "";
  return plate
    .toUpperCase()
    .replaceAll(/[\s\p{Pd}\u2212]/gu, "")
    .split("")
    .map((char) => REFERENCE_MAP[char] ?? char)
    .join("");
}

function referenceCheck(raw: string): { ok: true; value: string } | { ok: false } {
  const plate = referenceNormalize(raw);
  if (plate === "" || /\p{Script=Cyrillic}/u.test(plate)) return { ok: false };
  return { ok: true, value: plate };
}

/**
 * What people type into a plate field: both alphabets in both cases, digits,
 * every kind of separator, punctuation, and letters from other scripts.
 */
const TYPED = fc.string({
  unit: fc.constantFrom(
    ..."АВЕКМНОРСТУХавекмнорстух",
    ..."БГДЖЗИЙЛПФЦЧШЩЪЬЮЯбгджзийлпфцчшщъьюяЁЫЭІЈ",
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    ..."0123456789",
    ..." \t\n\u00a0-\u2010\u2011\u2012\u2013\u2014\u2015\u2212\ufe58\ufe63\uff0d",
    ...".,/_*ÄÖÜßΑΒΕ",
  ),
  maxLength: 12,
});

/** Anything at all, including lone surrogates. */
const ANY = fc.string({ unit: "binary", maxLength: 12 });

describe("parity with MotoManager's rules", () => {
  it.each([
    ["typed plates", TYPED],
    ["arbitrary Unicode", ANY],
  ])("normalises %s exactly as MotoManager did", (_, strings) => {
    fc.assert(
      fc.property(strings, (raw) => {
        expect(normalize(raw)).toBe(referenceNormalize(raw));
      }),
    );
  });

  it.each([
    ["typed plates", TYPED],
    ["arbitrary Unicode", ANY],
  ])("refuses and passes %s exactly as MotoManager did", (_, strings) => {
    fc.assert(
      fc.property(strings, (raw) => {
        const ours = check(raw);
        const theirs = referenceCheck(raw);
        expect(ours.ok).toBe(theirs.ok);
        if (ours.ok && theirs.ok) expect(ours.plate).toBe(theirs.value);
      }),
    );
  });
});
