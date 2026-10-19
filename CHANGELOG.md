# Changelog

## 0.1.0 (2026-10-20)

First version, covering Bulgaria: the plate rules of Наредба № I-45 and Наредба № I-181, read on 2026-10-19.

- Two entry points: `license-plates`, shared by all countries, and `license-plates/bg` for Bulgaria.
- `normalize`: Latin capitals, no separators, the twelve Cyrillic plate letters mapped to Latin. Identical to MotoManager's normaliser on any input.
- `check`: refuses an empty plate and a Cyrillic letter no plate has; nothing else.
- `classify`: which countries' formats fit, each reading tagged with its country (`COUNTRIES`: `["BG"]`).
- `format`: one display form, „CA 1234 BX“.
- `bg.classify`: regular, trailer, electric, personalised, transit, dealer, foreign resident, military and diplomatic plates, each with the provision it comes from; `bg.format`, `REGIONS`, `isRegionCode`, `LEGAL_BASIS`, `PLATE_LETTERS`.
