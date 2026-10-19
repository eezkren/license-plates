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
- The stored form is what MotoManager already stored before this package (MOTO-493); `test/parity.test.ts` checks that the two agree on any string.
- The stored form is the same for every country (ADR 0003): `normalize` and `check` live at the package root, not in a country module.
- Separators a plate from an uncovered country needs to be read („B-XY 123“) are lost in storage. `format` cannot put them back, because it does not know that country's formats (ADR 0003). That is the cost of one comparable form.

## Alternatives considered

- **Store as typed, compare normalised.** Two forms on file, and every reader must remember which one it has.
- **Store in Cyrillic.** The reverse map is not one-to-one for foreign plates.
