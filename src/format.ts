import { classify } from "./classify.js";

/**
 * The one way to show a plate: „CA 1234 BX“.
 *
 * A plate is stored normalised, with no spaces (ADR 0002), and shown through
 * this function, so a screen, a printout and an e-mail all write it the same
 * way and a change of format is one edit. A recognised Bulgarian plate is
 * spaced the way it is printed on the plate; anything else, a foreign plate
 * included, is shown in its normalised form, because without knowing the format
 * there is no honest place to put a space.
 */
export function format(raw: string): string {
  return classify(raw).display;
}
