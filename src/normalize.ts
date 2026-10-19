import { CYRILLIC_TO_LATIN, type CyrillicPlateLetter } from "./letters.js";

/**
 * Whitespace and every dash a keyboard produces: `\p{Pd}` is all Unicode dash
 * punctuation (ASCII hyphen, the smart dashes macOS and iOS type, Word's
 * non-breaking hyphen, a CJK IME's fullwidth form), plus U+2212 MINUS SIGN,
 * which Unicode files under `Sm` and would otherwise slip through.
 *
 * Separators carry no meaning on a plate: the regulation defines the number as
 * letters and digits only (Наредба № I-45, чл. 23, ал. 1), and people write the
 * same plate as „CA 1234 BX“, „CA-1234-BX“ and „CA1234BX“.
 *
 * Module-level with `/g` is safe here because it is only ever passed to
 * `replaceAll`, which does not keep `lastIndex` between calls.
 */
const SEPARATORS = /[\s\p{Pd}\u2212]/gu;

/** The twelve Cyrillic plate letters, as one character class. */
const CYRILLIC_PLATE_LETTER = new RegExp(`[${Object.keys(CYRILLIC_TO_LATIN).join("")}]`, "gu");

/**
 * The form a plate is stored and compared in: upper case, no separators, and
 * the twelve Cyrillic plate letters replaced by the Latin letters they look
 * like, so „СА 1234 ВХ“ typed on a Bulgarian keyboard and „CA1234BX“ typed on a
 * Latin one are the same plate (ADR 0002).
 *
 * Nothing else is touched. A Cyrillic letter outside the twelve stays as it is,
 * so `check` can refuse it; a Latin letter outside the twelve stays too, because
 * a foreign plate may carry it (ADR 0001).
 *
 * A missing value (`null`, `undefined`, `""`) normalises to `""` rather than
 * throwing, for callers in plain JavaScript.
 */
export function normalize(raw: string): string {
  // `!raw` and not `raw === ""`: the guard is for callers without types.
  if (!raw) return "";
  return (
    raw
      .toUpperCase()
      .replaceAll(SEPARATORS, "")
      // The pattern matches the map's keys and nothing else, so `letter` is one.
      .replaceAll(
        CYRILLIC_PLATE_LETTER,
        (letter) => CYRILLIC_TO_LATIN[letter as CyrillicPlateLetter],
      )
  );
}
