/**
 * Bulgaria: the plate formats of Наредба № I-45 and Наредба № I-181 (МВР).
 *
 * `import { classify } from "license-plates/bg"` answers „български ли е този
 * номер и от какъв вид“. `normalize` and `check` are the package's own, shared
 * by every country, and are re-exported here so one import is enough.
 */
export { normalize } from "../normalize.js";
export { check, MAX_PLATE_LENGTH, type CheckResult, type RefusalReason } from "../check.js";
export type { InvalidPlate, UnrecognisedPlate } from "../result.js";
export {
  classify,
  LEGAL_BASIS,
  type BulgarianPlate,
  type Classification,
  type DealerPlate,
  type DiplomaticPlate,
  type ElectricPlate,
  type ForeignerPlate,
  type MilitaryPlate,
  type PersonalisedPlate,
  type PlateKind,
  type RegularPlate,
  type TrailerPlate,
  type TransitPlate,
} from "./classify.js";
export { format } from "./format.js";
export { REGIONS, isRegionCode, type Region, type RegionCode } from "./regions.js";
export { PLATE_LETTERS } from "./letters.js";
