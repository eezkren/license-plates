/**
 * The twelve letters a Bulgarian plate can carry, keyed by the Cyrillic letter
 * the regulation names, valued by the Latin letter that looks the same.
 *
 * Наредба № I-45, чл. 24, ал. 7 names them for the personalised plate: „главни
 * букви на кирилица (А, В, Е, К, М, Н, О, Р, С, Т, У и Х)“. МВР states that the
 * same twelve are the only letters used for the registration code and the series
 * since 1992, because they are the letters Cyrillic and Latin share (mvr.bg,
 * „Регистрация на превозните средства в Р. България и видове регистрационни
 * табели“, part II.1.1). See docs/sources.md.
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

/** The same twelve letters in the Latin form a plate is stored in. */
export const PLATE_LETTERS = "ABEKMHOPCTYX";
