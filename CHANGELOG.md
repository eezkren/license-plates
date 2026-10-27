# Changelog

## 0.2.0 (2026-10-27)

- `check` refuses a plate longer than twelve characters after normalising, with `reason: "too-long"`, before it looks at the letters. `classify` answers such a plate `invalid` with the same reason. The longest European format, the Irish YYH-CC-SSSSSS, is eleven; twelve leaves one spare (README, „Why twelve characters“).
- `MAX_PLATE_LENGTH` (12) is exported from `license-plates` and `license-plates/bg`, counted after normalisation, so a field's `maxlength` needs room for the dashes and spaces typed with it.
- `RefusalReason` and `InvalidPlate` gain `"too-long"`: a caller that switches over the reason exhaustively has a new case to handle.

## 0.1.0 (2026-10-20)

First version, covering Bulgaria: the plate rules of Наредба № I-45 and Наредба № I-181, read on 2026-10-19.

- Two entry points: `license-plates`, shared by all countries, and `license-plates/bg` for Bulgaria.
- `normalize`: Latin capitals, no separators, the twelve Cyrillic plate letters mapped to Latin. Identical to MotoManager's normaliser on any input.
- `check`: refuses an empty plate and a Cyrillic letter no plate has; nothing else.
- `classify`: which countries' formats fit, each reading tagged with its country (`COUNTRIES`: `["BG"]`).
- `format`: one display form, „CA 1234 BX“.
- `bg.classify`: regular, trailer, electric, personalised, transit, dealer, foreign resident, military and diplomatic plates, each with the provision it comes from; `bg.format`, `REGIONS`, `isRegionCode`, `LEGAL_BASIS`, `PLATE_LETTERS`.
