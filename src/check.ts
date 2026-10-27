import { normalize } from "./normalize.js";

/**
 * Any Cyrillic letter. After `normalize` has mapped the twelve look-alike
 * letters to Latin, a Cyrillic letter that is left is one no Bulgarian plate
 * has: Б, Г, Д and the rest of the Bulgarian alphabet (a Bulgarian plate carries
 * only А В Е К М Н О Р С Т У Х, see letters.ts), and Ё, Ы, Э or Serbian Ј.
 *
 * Any Cyrillic letter, not a list of them, because that is MotoManager's rule
 * and this package must refuse exactly what it refuses. It does
 * refuse one real plate letter: Ukrainian plates use І (U+0406). A Ukrainian
 * plate typed in Cyrillic is therefore refused rather than warned about; mapping
 * І to Latin I is a change to make in both places at once.
 *
 * Only Cyrillic, and not "anything outside the twelve": a Latin letter such as
 * „G“ or „Ü“ can be on a foreign plate, and this package does not decide that a
 * plate is not foreign (ADR 0001, ADR 0003).
 */
const CYRILLIC = /\p{Script=Cyrillic}/gu;

/**
 * The longest plate `check` passes, counted after `normalize` in UTF-16 code
 * units. A field's `maxlength` needs more: the dashes and spaces typed with the
 * plate count there too.
 *
 * The longest European format is the Irish one since 2013, YYH-CC-SSSSSS: two
 * digits of the year, the half-year (1 or 2), a county code of one or two
 * letters and a sequence of up to six digits, eleven characters without the
 * dashes. The year and half-year digits come from S.I. No. 542 of 2012 and
 * S.I. No. 452 of 2013 (irishstatutebook.ie), the county codes from Revenue's
 * „Registration number format“ (revenue.ie/en/vrt/documents/vrt/
 * registration-number-format.pdf); the six-digit sequence is the format as
 * issued, not a figure read in the statute. Twelve is eleven plus one spare. A Bulgarian plate is at most eight;
 * eight would refuse Irish plates and German historic H plates („M-AB 1234H“,
 * ten).
 *
 * It is a ceiling against what no plate can be (a paste of a whole sentence),
 * not a country's rule, so it applies whatever country the plate is from.
 */
export const MAX_PLATE_LENGTH = 12;

/** Why `check` refused a plate. */
export type RefusalReason = "empty" | "too-long" | "impossible-characters";

/** The answer of `check`: the normalised plate, or why it cannot be a plate. */
export type CheckResult =
  | { readonly ok: true; readonly plate: string }
  | { readonly ok: false; readonly reason: "empty"; readonly plate: "" }
  | { readonly ok: false; readonly reason: "too-long"; readonly plate: string }
  | {
      readonly ok: false;
      readonly reason: "impossible-characters";
      readonly plate: string;
      /** Each impossible character once, in the order it first appears. */
      readonly characters: readonly string[];
    };

/**
 * The only refusal this package makes. A plate is refused when it normalises to
 * nothing (blank, or dashes only), when it is longer than `MAX_PLATE_LENGTH`
 * after normalising, or when it keeps a Cyrillic letter outside the twelve
 * look-alikes. Length is checked before letters: a plate too long to be one is
 * refused as that, without listing its letters. Everything else passes, including a format nobody recognises:
 * whether a plate looks Bulgarian is `classify`'s question, and its answer is a
 * warning, not a refusal (ADR 0001).
 *
 * The plate in the answer is the normalised one, the form to store.
 */
export function check(raw: string): CheckResult {
  const plate = normalize(raw);
  if (plate === "") return { ok: false, reason: "empty", plate };
  if (plate.length > MAX_PLATE_LENGTH) return { ok: false, reason: "too-long", plate };
  const characters = [...new Set(plate.match(CYRILLIC))];
  if (characters.length > 0) {
    return { ok: false, reason: "impossible-characters", plate, characters };
  }
  return { ok: true, plate };
}
