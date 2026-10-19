# Changelog

## 0.1.0 (unreleased)

First version: Bulgaria's plate rules from Наредба № I-45 and Наредба № I-181, read on 2026-10-19.

- `normalize`: Latin capitals, no separators, the twelve Cyrillic plate letters mapped to Latin. Identical to MotoManager's normaliser on any input.
- `check`: refuses an empty plate and a Cyrillic letter no plate has; nothing else.
- `classify`: regular, trailer, electric, personalised, transit, dealer, foreign resident, military and diplomatic plates, each with the provision it comes from.
- `format`: one display form, „CA 1234 BX“.
- `REGIONS`, `LEGAL_BASIS`, `CYRILLIC_TO_LATIN`, `PLATE_LETTERS`.
