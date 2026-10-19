/**
 * The country-neutral entry: one stored form for any plate (`normalize`), the
 * one refusal (`check`), which country a plate can be from (`classify`) and the
 * one display form (`format`). Each country's own rules live in its module,
 * also reachable as `license-plates/<country>`.
 */
export { normalize } from "./normalize.js";
export { check, type CheckResult, type RefusalReason } from "./check.js";
export {
  classify,
  COUNTRIES,
  type Classification,
  type Country,
  type CountryPlate,
  type RecognisedPlate,
} from "./classify.js";
export { format } from "./format.js";
export type { InvalidPlate, UnrecognisedPlate } from "./result.js";
export { CYRILLIC_TO_LATIN, type CyrillicPlateLetter } from "./letters.js";
export * as bg from "./bg/index.js";
