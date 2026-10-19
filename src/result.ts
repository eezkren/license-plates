import type { CheckResult } from "./check.js";

/**
 * A plate that matches no format this package knows. It can still be a plate,
 * from a country the package does not cover, so this is a warning to show, not
 * a reason to refuse (ADR 0001).
 */
export interface UnrecognisedPlate {
  readonly status: "unrecognised";
  /** The normalised plate. */
  readonly plate: string;
  /** The normalised plate again: without a known format there is no place for a space. */
  readonly display: string;
}

/** A plate `check` refuses: empty, or with a character no plate has. */
export type InvalidPlate =
  | {
      readonly status: "invalid";
      readonly reason: "empty";
      readonly plate: "";
      readonly display: "";
    }
  | {
      readonly status: "invalid";
      readonly reason: "impossible-characters";
      readonly plate: string;
      readonly display: string;
      /** Each impossible character once, in the order it first appears. */
      readonly characters: readonly string[];
    };

/** `check`'s refusal, in the shape every `classify` answers in. */
export function refuse(refusal: Exclude<CheckResult, { ok: true }>): InvalidPlate {
  if (refusal.reason === "empty") {
    return { status: "invalid", reason: "empty", plate: "", display: "" };
  }
  const { reason, plate, characters } = refusal;
  return { status: "invalid", reason, plate, display: plate, characters };
}

/** The answer for a plate no format fits. */
export function unrecognised(plate: string): UnrecognisedPlate {
  return { status: "unrecognised", plate, display: plate };
}
