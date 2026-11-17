/**
 * The thirteen Cyrillic capitals that look like Latin ones, keyed by the
 * Cyrillic letter, valued by the Latin letter it looks like. `normalize` maps
 * them, so a plate typed on a Cyrillic keyboard is stored the same as one typed
 * on a Latin one (ADR 0002).
 *
 * Twelve are the letters a Bulgarian plate may carry: Наредба № I-45, чл. 24,
 * ал. 7 names them, „главни букви на кирилица (А, В, Е, К, М, Н, О, Р, С, Т, У и
 * Х)“, and МВР uses only them since 1992 because Cyrillic and Latin share them
 * (see docs/sources.md). The thirteenth, Ukrainian and Belarusian І (U+0406),
 * is on Ukrainian plates: МВС writes the series of Ukrainian plates in А В С Е Н
 * І К М О Р Т Х (docs/sources.md, „Ukraine“). Added in 0.3.0, so „АА 1234 ВІ“
 * typed on a Ukrainian keyboard is stored as „AA1234BI“, not refused. No
 * Bulgarian plate carries I; `bg.PLATE_LETTERS` stays twelve.
 *
 * One map for every country, because there is one stored form: a country whose
 * plates use another Cyrillic look-alike extends this map for all of them.
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
  І: "I",
} as const);

/** One of the thirteen Cyrillic look-alikes `normalize` maps to Latin. */
export type CyrillicPlateLetter = keyof typeof CYRILLIC_TO_LATIN;
