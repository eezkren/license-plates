import { classify } from "./classify.js";

/**
 * A plate as it is printed on a Bulgarian plate: „CA 1234 BX“, „123 T 456“,
 * „CA MOTOP1“. Anything that is not a Bulgarian format is shown normalised.
 */
export function format(raw: string): string {
  return classify(raw).display;
}
