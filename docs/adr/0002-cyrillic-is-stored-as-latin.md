# ADR 0002: A plate is stored in Latin letters, whatever alphabet it was typed in

**Date:** 2026-10-19
**Status:** Accepted

## Context

A Bulgarian plate uses only twelve letters: А В Е К М Н О Р С Т У Х. МВР has used only these for codes and series since 1992, because Cyrillic and Latin share them, so a plate reads the same to a Bulgarian and to a foreign camera or police officer; Наредба № I-45, чл. 24, ал. 7 names the same twelve for the personalised plate.

People type them both ways. On a Bulgarian keyboard „СА 1234 ВХ“ is six Cyrillic letters; on an English one „CA 1234 BX“ is six Latin letters. They look identical and are different strings. Stored as typed, the same car becomes two records, and a search for one misses the other.

## Decision

1. **One stored form: Latin, upper case, no separators.** `normalize` upper-cases, strips whitespace and every dash (`\p{Pd}` plus U+2212 MINUS SIGN), and maps the twelve Cyrillic letters to the Latin letters they look like: А→A, В→B, Е→E, К→K, М→M, Н→H, О→O, Р→P, С→C, Т→T, У→Y, Х→X.
2. **Latin, not Cyrillic,** because the other direction is ambiguous: a Latin „B“ on a foreign plate is not a Cyrillic „В“, while a Cyrillic „В“ on a Bulgarian plate is always the Latin-looking letter. Latin is also what foreign systems (ANPR cameras, insurers, EU databases) hold.
3. **Nothing else is mapped.** A Cyrillic letter outside the twelve stays, so `check` can refuse it (ADR 0001). A Latin letter outside the twelve stays, because a foreign plate may carry it.
4. **Display goes through one function,** `format`, which spaces a recognised plate the way it is printed („CA 1234 BX“) and shows anything else in its stored form.

## Consequences

- „СА 1234 ВХ“, „ca-1234-bx“ and „CA1234BX“ are one plate, and compare equal after `normalize`.
- The stored form is what MotoManager already stored before this package; `test/parity.test.ts` checks that the two agree on any string.
- The stored form is the same for every country (ADR 0003): `normalize` and `check` live at the package root, not in a country module.
- Separators a plate from an uncovered country needs to be read („B-XY 123“) are lost in storage. `format` cannot put them back, because it does not know that country's formats (ADR 0003). That is the cost of one comparable form.

## Amendment, 2026-11-17 (0.3.0): Ukrainian І

The map has a thirteenth letter: Ukrainian (and Belarusian) І, U+0406, maps to Latin I.

Ukrainian plates write their series in А В С Е Н І К М О Р Т Х, the Cyrillic letters that look like Latin ones (МВС's „Вимоги до державних номерних знаків транспортних засобів“, Додаток 5; docs/sources.md, „Ukraine“). Until 0.3.0, „АА 1234 ВІ“ typed on a Ukrainian keyboard kept its І, and `check` refused it, while „AA 1234 BI“ typed in Latin passed with a warning: one car, two answers. MotoManager's public booking form asks for the plate, so a Ukrainian customer was turned away. The founder decided on 2026-11-13 that І is stored as I, so the plate has one stored form whatever keyboard typed it.

What changes and what does not:

- Decision 1 reads „the thirteen Cyrillic letters“; the map adds І→I. Decision 2 holds for І as for the twelve: Latin I is what any foreign system holds.
- Decision 3 holds: nothing else is mapped. Every other Cyrillic letter, including Ukrainian Ї, Є, Ґ and Belarusian Ў, is still refused by `check`.
- No Bulgarian plate carries I, so `bg.PLATE_LETTERS` stays twelve and `bg.classify` reads a plate with I as not Bulgarian: „AA1234BI“ is `unrecognised`, a warning.
- A stored form changes only for input that `check` refused before, so nothing stored with 0.2.0 needs migrating.
- Belarus was not checked in a primary source and nothing was changed for it (docs/sources.md, „Belarus“).

## Alternatives considered

- **Store as typed, compare normalised.** Two forms on file, and every reader must remember which one it has.
- **Store in Cyrillic.** The reverse map is not one-to-one for foreign plates.
