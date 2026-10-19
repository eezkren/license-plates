# ADR 0001: An unrecognised plate is a warning, not a refusal

**Date:** 2026-10-19
**Status:** Accepted

## Context

The package answers „на коя държава може да е този номер“ (which country can this plate be from), not „валиден ли е“ (is it valid). The people typing plates are at a service counter in Bulgaria, and foreign cars come in: a Romanian, a German or a Turkish plate is a real plate that matches no Bulgarian format.

The package also cannot know whether a Bulgarian-looking plate was ever issued. МВР publishes formats, not the register.

## Decision

1. **Refuse only what no plate can be.** `check` refuses a plate that normalises to nothing (blank, dashes only) and one that keeps a Cyrillic letter after the twelve look-alikes А В Е К М Н О Р С Т У Х are mapped to Latin. A Bulgarian plate carries only those twelve (МВР's rule since 1992 for codes and series; Наредба № I-45, чл. 24, ал. 7 for the personalised plate), and no plate carries Б or Ж. The rule is "any Cyrillic letter left" because that is MotoManager's rule, which the package must match; its one known cost is Ukrainian І, a real plate letter, which is refused too (see `src/check.ts`).
2. **Everything else passes `check`.** A Latin letter outside the twelve („G“, „Ü“), a dot, a format nobody knows: all pass. They can be on a foreign plate.
3. **`classify` answers, it does not judge.** A plate is `recognised` (with its country and kind), `unrecognised` (no covered country's format fits), or `invalid` (what `check` refuses). The caller decides what to do with `unrecognised`; the intended answer is a warning such as „Не прилича на български номер. Сигурни ли сте?“.

## Consequences

- „AA1234GG“ is stored if the person confirms it, because it may be foreign. It is never silently accepted as Bulgarian: `classify` says `unrecognised`.
- A typo that leaves no Bulgarian format („CA 1234 BG“) is a warning, not an error. The person sees it and can fix it.
- A typo that still fits a format is not even a warning. The personalised plate allows any six of the twelve letters and digits after a region's code (чл. 24, ал. 7), so „PB 123 AB“, a regular plate missing a digit, reads as Русе's personalised „P B123AB“. The package answers what a plate can be, not what it most likely is.
- Nothing about a plate is ever lost to a too-strict rule. A rule that is wrong costs a warning, not a refused customer.

## Alternatives considered

- **Refuse unrecognised formats.** Locks out every foreign car, and every Bulgarian format this package does not know yet (the regulation leaves codes and series to ГДНП, which adds them without notice).
- **Refuse any letter outside the twelve.** Same problem for foreign plates; only Cyrillic letters are impossible everywhere a Bulgarian workshop would see.
