/** A region a registration code belongs to. */
export interface Region {
  /** The region's name in Bulgarian. */
  readonly name: string;
  /** The region's name in English. */
  readonly nameEn: string;
}

const SOFIA_CITY: Region = { name: "София (столица)", nameEn: "Sofia City" };

/**
 * The registration code of each region, in the Latin form a plate is stored in.
 *
 * The regulation does not list them. Наредба № I-45, чл. 24, ал. 1, т. 2 makes
 * the code „една или комбинация от две букви“, and чл. 24, ал. 2 leaves the codes
 * and the series to ГДНП (Главна дирекция „Национална полиция“), which does not
 * publish its list. docs/sources.md links, for each region, the notice of its
 * own police directorate that shows the code; 13 of the 28 regions had one on
 * 2026-10-19, and the rest are kept at their long-standing codes until they do.
 *
 * Sofia City has three codes because each ran out of numbers in turn: С, then
 * СА, then СВ.
 */
export const REGIONS = Object.freeze({
  E: { name: "Благоевград", nameEn: "Blagoevgrad" },
  A: { name: "Бургас", nameEn: "Burgas" },
  B: { name: "Варна", nameEn: "Varna" },
  BT: { name: "Велико Търново", nameEn: "Veliko Tarnovo" },
  BH: { name: "Видин", nameEn: "Vidin" },
  BP: { name: "Враца", nameEn: "Vratsa" },
  EB: { name: "Габрово", nameEn: "Gabrovo" },
  TX: { name: "Добрич", nameEn: "Dobrich" },
  K: { name: "Кърджали", nameEn: "Kardzhali" },
  KH: { name: "Кюстендил", nameEn: "Kyustendil" },
  OB: { name: "Ловеч", nameEn: "Lovech" },
  M: { name: "Монтана", nameEn: "Montana" },
  PA: { name: "Пазарджик", nameEn: "Pazardzhik" },
  PK: { name: "Перник", nameEn: "Pernik" },
  EH: { name: "Плевен", nameEn: "Pleven" },
  PB: { name: "Пловдив", nameEn: "Plovdiv" },
  PP: { name: "Разград", nameEn: "Razgrad" },
  P: { name: "Русе", nameEn: "Ruse" },
  CC: { name: "Силистра", nameEn: "Silistra" },
  CH: { name: "Сливен", nameEn: "Sliven" },
  CM: { name: "Смолян", nameEn: "Smolyan" },
  C: SOFIA_CITY,
  CA: SOFIA_CITY,
  CB: SOFIA_CITY,
  CO: { name: "София (област)", nameEn: "Sofia Province" },
  CT: { name: "Стара Загора", nameEn: "Stara Zagora" },
  T: { name: "Търговище", nameEn: "Targovishte" },
  X: { name: "Хасково", nameEn: "Haskovo" },
  H: { name: "Шумен", nameEn: "Shumen" },
  Y: { name: "Ямбол", nameEn: "Yambol" },
} as const satisfies Readonly<Record<string, Region>>);

/** A region's registration code, such as `"CA"` or `"PB"`. */
export type RegionCode = keyof typeof REGIONS;

/** Whether a code is a region's registration code. */
export function isRegionCode(code: string): code is RegionCode {
  return Object.hasOwn(REGIONS, code);
}
