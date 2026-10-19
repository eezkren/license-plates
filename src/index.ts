export { normalize } from "./normalize.js";
export { check, type CheckResult, type RefusalReason } from "./check.js";
export {
  classify,
  LEGAL_BASIS,
  type BulgarianPlate,
  type Classification,
  type DealerPlate,
  type DiplomaticPlate,
  type ElectricPlate,
  type ForeignerPlate,
  type InvalidPlate,
  type MilitaryPlate,
  type PersonalisedPlate,
  type PlateKind,
  type RegularPlate,
  type TrailerPlate,
  type TransitPlate,
  type UnrecognisedPlate,
} from "./classify.js";
export { format } from "./format.js";
export { REGIONS, isRegionCode, type Region, type RegionCode } from "./regions.js";
export { CYRILLIC_TO_LATIN, PLATE_LETTERS, type CyrillicPlateLetter } from "./letters.js";
