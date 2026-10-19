import { check } from "../check.js";
import { refuse, unrecognised, type InvalidPlate, type UnrecognisedPlate } from "../result.js";
import { REGIONS, isRegionCode, type Region, type RegionCode } from "./regions.js";

/** The kinds of Bulgarian plate this module recognises. */
export type PlateKind =
  | "regular"
  | "trailer"
  | "electric"
  | "personalised"
  | "transit"
  | "dealer"
  | "foreigner"
  | "military"
  | "diplomatic";

/**
 * Where each kind's rule comes from. Every recognised plate carries its kind's
 * entry as `basis`, so a screen can say why a plate was read the way it was.
 * docs/sources.md quotes each provision and links the text it was read from.
 *
 * Two entries rest on less than a provision, and say so: the trailer's Е series
 * and the electric motorcycle's code ЕМ are ГДНП's choices under чл. 24, ал. 2,
 * which no published МВР text states (checked 2026-10-19).
 */
export const LEGAL_BASIS = Object.freeze({
  regular: "Наредба № I-45, чл. 24, ал. 1 и 2",
  trailer:
    "Наредба № I-45, чл. 24, ал. 1 и 2; серията Е за ремаркета е практика на ГДНП, не текст на наредбата",
  electric:
    "Наредба № I-45, чл. 23, ал. 4 и чл. 24, ал. 1 и 2; кодовете ЕА и ЕМ определя ГДНП (ЕМ непотвърден)",
  personalised: "Наредба № I-45, чл. 24, ал. 6–8",
  transit: "Наредба № I-45, чл. 29, ал. 3",
  dealer: "Наредба № I-45, чл. 30, ал. 2",
  foreigner: "Наредба № I-181, чл. 17, ал. 1, т. 2, ал. 2, т. 4 и ал. 3",
  military:
    "Наредба № Н-13 от 2004 г. на министъра на отбраната, по описанието на МВР; Наредба № I-45, чл. 31",
  diplomatic: "Наредба № I-181, чл. 17, ал. 1, т. 1 и ал. 2, т. 1–3",
} as const satisfies Readonly<Record<PlateKind, string>>);

interface Recognised<K extends PlateKind> {
  readonly status: "recognised";
  readonly country: "BG";
  readonly kind: K;
  /** The normalised plate: the form to store and compare. */
  readonly plate: string;
  /** The plate as it is written on the plate, with spaces: „CA 1234 BX“. */
  readonly display: string;
  /** The provision the format comes from, see `LEGAL_BASIS`. */
  readonly basis: string;
}

/** Region code, four digits, series: „CA 1234 BX“ (Наредба № I-45, чл. 24, ал. 1). */
export interface RegularPlate extends Recognised<"regular"> {
  readonly code: RegionCode;
  readonly region: Region;
  /** The four-digit serial number, „пореден номер“. */
  readonly number: string;
  /** One or two letters, „серия“. */
  readonly series: string;
}

/**
 * A regular plate whose series begins with Е, the series ГДНП gives trailers.
 *
 * The one kind no published text confirms: the regulation leaves series to ГДНП
 * (Наредба № I-45, чл. 24, ал. 2) and no МВР page found on 2026-10-19 says which
 * series trailers get. Read it as "probably a trailer". A trailer plate is a
 * regular Bulgarian plate either way, so the answer to "can this be Bulgarian"
 * does not depend on it.
 */
export interface TrailerPlate extends Recognised<"trailer"> {
  readonly code: RegionCode;
  readonly region: Region;
  readonly number: string;
  readonly series: string;
}

/**
 * An all-electric vehicle's plate: ЕА (car) or ЕМ (motorcycle) in place of the
 * region code, with four digits and a series, written in green (Наредба № I-45,
 * чл. 23, ал. 4). The codes are ГДНП's (чл. 24, ал. 2): notices of СДВР, ОДМВР
 * Варна and ОДМВР Разград show ЕА in use; ЕМ appears on no МВР page found on
 * 2026-10-19.
 */
export interface ElectricPlate extends Recognised<"electric"> {
  readonly code: "EA" | "EM";
  readonly number: string;
  readonly series: string;
}

/**
 * Region code and six letters or digits of the owner's choice, „надпис по
 * желание“ (Наредба № I-45, чл. 24, ал. 6 и 7).
 */
export interface PersonalisedPlate extends Recognised<"personalised"> {
  readonly code: RegionCode;
  readonly region: Region;
  /** The six characters the owner chose. */
  readonly text: string;
}

/**
 * Single-use transit plate: digits either side of Т, Н or М (Наредба № I-45,
 * чл. 29, ал. 3). Six digits, or five for a category L vehicle (motorcycles,
 * mopeds, tricycles, quadricycles), which only ever use М.
 */
export interface TransitPlate extends Recognised<"transit"> {
  readonly letter: "T" | "H" | "M";
  readonly before: string;
  readonly after: string;
  /** Five digits rather than six: a plate for a category L vehicle. */
  readonly categoryL: boolean;
}

/**
 * A dealer's temporary plate, „временни табели“: digits either side of В
 * (Наредба № I-45, чл. 30, ал. 2). Six digits, or five for category L.
 */
export interface DealerPlate extends Recognised<"dealer"> {
  readonly before: string;
  readonly after: string;
  readonly categoryL: boolean;
}

/**
 * A foreign resident's plate: ХХ or ХН and four digits, white on blue (Наредба
 * № I-181, чл. 17, ал. 1, т. 2; ХН added by ДВ, бр. 8 от 2019 г.).
 */
export interface ForeignerPlate extends Recognised<"foreigner"> {
  readonly code: "XX" | "XH";
  readonly number: string;
}

/** The armed forces' plate: ВА and six digits. */
export interface MilitaryPlate extends Recognised<"military"> {
  readonly code: "BA";
  readonly number: string;
}

/**
 * A foreign mission's plate, white on red (Наредба № I-181, чл. 17): С for
 * diplomatic status, СС for consular status, СТ for administrative and technical
 * staff and accredited foreign correspondents. Four digits.
 */
export interface DiplomaticPlate extends Recognised<"diplomatic"> {
  readonly code: "C" | "CC" | "CT";
  readonly holder: "diplomatic" | "consular" | "staff";
  readonly number: string;
}

/** A plate that can be Bulgarian, with what kind it is and its parts. */
export type BulgarianPlate =
  | RegularPlate
  | TrailerPlate
  | ElectricPlate
  | PersonalisedPlate
  | TransitPlate
  | DealerPlate
  | ForeignerPlate
  | MilitaryPlate
  | DiplomaticPlate;

/**
 * The answer of the Bulgarian `classify`: a Bulgarian plate, a plate in no
 * Bulgarian format (a warning, ADR 0001), or what `check` refuses.
 */
export type Classification = BulgarianPlate | UnrecognisedPlate | InvalidPlate;

/** Who holds a diplomatic plate, by its code (Наредба № I-181, чл. 17, ал. 2). */
const DIPLOMATIC_HOLDER = { C: "diplomatic", CC: "consular", CT: "staff" } as const;

/**
 * Can this be a Bulgarian plate, and of which kind?
 *
 * The question is „на коя държава може да е този номер“, not „валиден ли е“:
 * nothing here knows which numbers МВР has issued, only which formats it issues
 * them in. `unrecognised` means "not a Bulgarian format", not "not a plate".
 */
export function classify(raw: string): Classification {
  const checked = check(raw);
  if (!checked.ok) return refuse(checked);
  return readPlate(checked.plate) ?? unrecognised(checked.plate);
}

/**
 * The Bulgarian reading of a plate already normalised, or `undefined` when no
 * Bulgarian format fits. The formats are tried in this order, and the first
 * that fits wins:
 *
 * 1. military, diplomatic, foreigner: a fixed code and digits only;
 * 2. transit and dealer: digits either side of one letter;
 * 3. electric, trailer, regular: code, four digits, series;
 * 4. personalised: region code and six characters.
 *
 * The order only matters where one string fits two formats, and then the more
 * specific reading wins: „C1234AB“ fits the regular format (code С, series АВ)
 * and the personalised one (code С, text „1234AB“), and is read as regular.
 *
 * The personalised format is last because it is the widest: any six of the
 * twelve letters and digits after a region's code (чл. 24, ал. 7). So a regular
 * plate missing a digit („PB 123 AB“) or a two-row motorcycle plate typed in
 * reading order („PB A 3579“) still fits it, as Русе's „P B123AB“ and
 * „P BA3579“. That is the right answer to "can this be Bulgarian", and it means
 * a typo is caught only when it leaves no Bulgarian format at all.
 */
export function readPlate(plate: string): BulgarianPlate | undefined {
  return (
    readFixedCode(plate) ??
    readLetterBetweenDigits(plate) ??
    readSeriesPlate(plate) ??
    readPersonalised(plate)
  );
}

function readFixedCode(plate: string): BulgarianPlate | undefined {
  if (/^BA\d{6}$/.test(plate)) {
    const number = plate.slice(2);
    return {
      status: "recognised",
      country: "BG",
      kind: "military",
      plate,
      display: `BA ${number}`,
      basis: LEGAL_BASIS.military,
      code: "BA",
      number,
    };
  }
  if (/^(?:C|CC|CT)\d{4}$/.test(plate)) {
    const code = plate.slice(0, -4) as keyof typeof DIPLOMATIC_HOLDER;
    const number = plate.slice(-4);
    return {
      status: "recognised",
      country: "BG",
      kind: "diplomatic",
      plate,
      display: `${code} ${number}`,
      basis: LEGAL_BASIS.diplomatic,
      code,
      holder: DIPLOMATIC_HOLDER[code],
      number,
    };
  }
  if (/^X[XH]\d{4}$/.test(plate)) {
    const code = plate.slice(0, 2) as ForeignerPlate["code"];
    const number = plate.slice(2);
    return {
      status: "recognised",
      country: "BG",
      kind: "foreigner",
      plate,
      display: `${code} ${number}`,
      basis: LEGAL_BASIS.foreigner,
      code,
      number,
    };
  }
  return undefined;
}

function readLetterBetweenDigits(plate: string): BulgarianPlate | undefined {
  // Six digits split three and three, or five split two and three for category
  // L. The letter is always fourth from the end.
  const isTransit = /^(?:\d{3}[THM]|\d{2}M)\d{3}$/.test(plate);
  const isDealer = /^\d{2,3}B\d{3}$/.test(plate);
  if (!isTransit && !isDealer) return undefined;
  const before = plate.slice(0, -4);
  const letter = plate.charAt(plate.length - 4);
  const after = plate.slice(-3);
  const display = `${before} ${letter} ${after}`;
  const categoryL = before.length === 2;
  if (isDealer) {
    return {
      status: "recognised",
      country: "BG",
      kind: "dealer",
      plate,
      display,
      basis: LEGAL_BASIS.dealer,
      before,
      after,
      categoryL,
    };
  }
  return {
    status: "recognised",
    country: "BG",
    kind: "transit",
    plate,
    display,
    basis: LEGAL_BASIS.transit,
    letter: letter as TransitPlate["letter"],
    before,
    after,
    categoryL,
  };
}

function readSeriesPlate(plate: string): BulgarianPlate | undefined {
  if (!/^[ABEKMHOPCTYX]{1,2}\d{4}[ABEKMHOPCTYX]{1,2}$/.test(plate)) return undefined;
  const digitsAt = plate.search(/\d/);
  const code = plate.slice(0, digitsAt);
  const number = plate.slice(digitsAt, digitsAt + 4);
  const series = plate.slice(digitsAt + 4);
  const display = `${code} ${number} ${series}`;
  if (code === "EA" || code === "EM") {
    return {
      status: "recognised",
      country: "BG",
      kind: "electric",
      plate,
      display,
      basis: LEGAL_BASIS.electric,
      code,
      number,
      series,
    };
  }
  if (!isRegionCode(code)) return undefined;
  const parts = {
    status: "recognised",
    country: "BG",
    plate,
    display,
    code,
    region: REGIONS[code],
    number,
    series,
  } as const;
  return series.startsWith("E")
    ? { ...parts, kind: "trailer", basis: LEGAL_BASIS.trailer }
    : { ...parts, kind: "regular", basis: LEGAL_BASIS.regular };
}

function readPersonalised(plate: string): PersonalisedPlate | undefined {
  // Six characters always follow the code, so the code is whatever precedes the
  // last six, and it must be a region's. Then only the six's alphabet is left to
  // check: the twelve letters and digits (чл. 24, ал. 7).
  const code = plate.slice(0, -6);
  const text = plate.slice(-6);
  if (!isRegionCode(code) || !/^[ABEKMHOPCTYX\d]+$/.test(text)) return undefined;
  return {
    status: "recognised",
    country: "BG",
    kind: "personalised",
    plate,
    display: `${code} ${text}`,
    basis: LEGAL_BASIS.personalised,
    code,
    region: REGIONS[code],
    text,
  };
}
