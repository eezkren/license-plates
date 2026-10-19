import { normalize } from "./normalize.js";

/**
 * Any Cyrillic letter. After `normalize` has mapped the twelve plate letters to
 * Latin, a Cyrillic letter that is left is one no plate has: Б, Г, Д and the
 * rest of the Bulgarian alphabet (Наредба № I-45, чл. 24, ал. 7 allows only the
 * twelve), and Ё, Ы, Э, Ukrainian І or Serbian Ј, which are on no Bulgarian
 * plate either.
 *
 * Only Cyrillic, and not "anything outside the twelve": a Latin letter such as
 * „G“ or „Ü“ can be on a foreign plate, and this package does not decide that a
 * plate is not foreign (ADR 0001, ADR 0003).
 */
const CYRILLIC = /\p{Script=Cyrillic}/gu;

/** Why `check` refused a plate. */
export type RefusalReason = "empty" | "impossible-characters";

/** The answer of `check`: the normalised plate, or why it cannot be a plate. */
export type CheckResult =
  | { readonly ok: true; readonly plate: string }
  | { readonly ok: false; readonly reason: "empty"; readonly plate: "" }
  | {
      readonly ok: false;
      readonly reason: "impossible-characters";
      readonly plate: string;
      /** Each impossible character once, in the order it first appears. */
      readonly characters: readonly string[];
    };

/**
 * The only refusal this package makes. A plate is refused when it normalises to
 * nothing (blank, or dashes only) or when it keeps a Cyrillic letter that no
 * plate has. Everything else passes, including a format nobody recognises:
 * whether a plate looks Bulgarian is `classify`'s question, and its answer is a
 * warning, not a refusal (ADR 0001).
 *
 * The plate in the answer is the normalised one, the form to store.
 */
export function check(raw: string): CheckResult {
  const plate = normalize(raw);
  if (plate === "") return { ok: false, reason: "empty", plate };
  const characters = [...new Set(plate.match(CYRILLIC))];
  if (characters.length > 0) {
    return { ok: false, reason: "impossible-characters", plate, characters };
  }
  return { ok: true, plate };
}
