import { readPlate as readBulgarian, type BulgarianPlate } from "./bg/classify.js";
import { check } from "./check.js";
import { refuse, unrecognised, type InvalidPlate, type UnrecognisedPlate } from "./result.js";

/** The countries whose plates the package reads, as ISO 3166-1 alpha-2 codes. */
export const COUNTRIES = Object.freeze(["BG"] as const);

/** A country whose plates the package reads. */
export type Country = (typeof COUNTRIES)[number];

/** One country's reading of a plate; its `country` says whose. */
export type CountryPlate = BulgarianPlate;

/**
 * Each country's reader of a normalised plate. Keyed by country, so adding a
 * country to `COUNTRIES` does not compile until its module is wired in here.
 */
const READERS: Readonly<Record<Country, (plate: string) => CountryPlate | undefined>> = {
  BG: readBulgarian,
};

/** A plate at least one country's format fits. */
export interface RecognisedPlate {
  readonly status: "recognised";
  /** The normalised plate. */
  readonly plate: string;
  /** The plate as the first matching country prints it. */
  readonly display: string;
  /** Every country whose format fits, in `COUNTRIES` order. Never empty. */
  readonly matches: readonly [CountryPlate, ...CountryPlate[]];
}

/** The answer of `classify`. */
export type Classification = RecognisedPlate | UnrecognisedPlate | InvalidPlate;

/**
 * Which country can this plate be from, and as what kind of plate there?
 *
 * Every country the package covers reads the plate; each one whose format fits
 * is a match. Today that is Bulgaria alone (ADR 0003), so a plate is either a
 * Bulgarian match or `unrecognised`, which is a warning, never a refusal
 * (ADR 0001). Only what `check` refuses is `invalid`.
 */
export function classify(raw: string): Classification {
  const checked = check(raw);
  if (!checked.ok) return refuse(checked);
  const { plate } = checked;
  const [first, ...rest] = COUNTRIES.flatMap((country) => READERS[country](plate) ?? []);
  if (first === undefined) return unrecognised(plate);
  return { status: "recognised", plate, display: first.display, matches: [first, ...rest] };
}
