import { classify } from "./classify.js";

/**
 * The one way to show a plate: „CA 1234 BX“.
 *
 * A plate is stored normalised, with no spaces (ADR 0002), and shown through
 * this function, so a screen, a printout and an e-mail all write it the same
 * way and a change of format is one edit. A plate some country's format fits is
 * spaced the way that country prints it; anything else, an uncovered country's
 * plate included, is shown normalised, because without knowing the format there
 * is no honest place to put a space.
 */
export function format(raw: string): string {
  return classify(raw).display;
}
