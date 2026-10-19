/**
 * The twelve Cyrillic capitals that look like Latin ones, keyed by the Cyrillic
 * letter, valued by the Latin letter it looks like. `normalize` maps them, so a
 * plate typed on a Cyrillic keyboard is stored the same as one typed on a Latin
 * one (ADR 0002).
 *
 * They are the twelve letters a Bulgarian plate may carry: Наредба № I-45,
 * чл. 24, ал. 7 names them, „главни букви на кирилица (А, В, Е, К, М, Н, О, Р,
 * С, Т, У и Х)“, and МВР uses only them since 1992 because Cyrillic and Latin
 * share them (see docs/sources.md). A country whose plates use other Cyrillic
 * look-alikes would extend this map, for every country at once, because there is
 * one stored form.
 *
 * Upper case only: `normalize` upper-cases before it maps, so a lower-case key
 * could never be reached.
 */
export const CYRILLIC_TO_LATIN = Object.freeze({
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
} as const);

/** One of the twelve plate letters, in Cyrillic. */
export type CyrillicPlateLetter = keyof typeof CYRILLIC_TO_LATIN;
