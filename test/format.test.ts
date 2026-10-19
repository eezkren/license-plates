import { describe, expect, it } from "vitest";
import { format } from "../src/index.js";

describe("format", () => {
  it.each([
    ["regular", "ca1234bx", "CA 1234 BX"],
    ["regular, typed in Cyrillic with dashes", "СА-1234-ВХ", "CA 1234 BX"],
    ["trailer", "ЕВ1234ЕН", "EB 1234 EH"],
    ["electric", "еа1234вк", "EA 1234 BK"],
    ["personalised", "camotop1", "CA MOTOP1"],
    ["transit", "123т456", "123 T 456"],
    ["category L transit", "85м528", "85 M 528"],
    ["dealer", "198в229", "198 B 229"],
    ["foreign resident", "хх1234", "XX 1234"],
    ["foreign resident, ХН", "хн1234", "XH 1234"],
    ["military", "ва123456", "BA 123456"],
    ["diplomatic", "ст1234", "CT 1234"],
  ])("spaces a %s plate the way it is printed", (_, raw, shown) => {
    expect(format(raw)).toBe(shown);
  });

  it("shows a plate in an unknown format as normalised: there is no honest place for a space", () => {
    expect(format("b-xy 123")).toBe("BXY123");
  });

  it("shows a refused plate as normalised too, rather than throwing", () => {
    expect(format("са 1234 бв")).toBe("CA1234БB");
    expect(format("—")).toBe("");
    expect(format(null as unknown as string)).toBe("");
  });

  it("is stable: formatting a formatted plate changes nothing", () => {
    expect(format(format("са1234вх"))).toBe("CA 1234 BX");
  });
});
