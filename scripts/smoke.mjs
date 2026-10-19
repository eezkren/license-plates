// Imports the built package the way a consumer does and checks one answer of
// each function. CI runs it on the oldest Node versions package.json allows,
// which the dev tools themselves no longer run on.
import assert from "node:assert/strict";
import { check, classify, format, normalize } from "../dist/index.js";

assert.equal(normalize("св 1234 ах"), "CB1234AX");
assert.deepEqual(check("ca 1234 bд"), {
  ok: false,
  reason: "impossible-characters",
  plate: "CA1234BД",
  characters: ["Д"],
});
assert.equal(classify("ХН 0042").kind, "foreigner");
assert.equal(classify("B-XY 123").status, "unrecognised");
assert.equal(format("са-1234-вх"), "CA 1234 BX");

console.log(`bg-license-plates works on Node ${process.version}`);
