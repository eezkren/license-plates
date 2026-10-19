# ADR 0003: Bulgaria first, one module per country

**Date:** 2026-10-19
**Status:** Accepted (amended the same day: the package was first named `bg-license-plates` and Bulgaria-only in its shape too; the founder renamed it `license-plates` so that it can grow)

## Context

Every country has its own plate formats and nobody maintains them in one place, as libphonenumber does for phone numbers. The one npm package that covers Bulgaria among others (reviewed 2026-10-10) accepts any Latin letter and does not know Cyrillic, which is the gap this package fills.

A package that claims many countries and keeps none of them current does more harm than one that does one country properly: a wrong rule is a refused customer or a false warning, and nobody can tell which rules were checked. Still, a workshop in Bulgaria sees Romanian, Greek and Turkish cars, so the question „на коя държава може да е този номер“ will one day need more than one country, and the package should not have to be renamed or reshaped when it does.

## Decision

1. **Bulgaria is the only country covered today.**
2. **Each country is a module** in its own folder (`src/bg/`), with its own entry point (`license-plates/bg`), its own rules, its own sources and its own tests (`test/bg/`). Its `classify` answers for that country alone: „български ли е и от какъв вид“.
3. **The root entry is country-neutral.** `normalize` and `check` are shared by every country, because a plate has one stored form whatever its country (ADR 0002). The root `classify` asks every country's module and answers with all the readings that fit, each tagged with its `country`; `format` prints the first. With one country that is one reading or none.
4. **A country is added only when a real user needs it** (MotoManager asks first), read from that country's primary source with the provision cited next to each rule, never from Wikipedia (its CC BY-SA licence would bind this package, and it lags behind the regulations). Adding one is a new folder, a new entry in `COUNTRIES` and its reader; the compiler refuses a country in `COUNTRIES` without a reader.

## Consequences

- Callers that care about Bulgaria import `license-plates/bg` and never see another country's shapes. Callers that ask "which country" use the root and get a list, which is the honest answer once formats overlap between countries.
- `unrecognised` means "no covered country's format", never "not a plate".
- Until a second country exists, the root `classify` is the Bulgarian one with its answer wrapped in `matches`; a test pins that they agree on every input.

## Alternatives considered

- **Several countries from the start, from Wikipedia's tables.** Faster to write, impossible to vouch for, and incompatible with the MIT licence.
- **Bulgaria-only in name and shape (`bg-license-plates`).** Simplest today, a rename and a breaking API change the day a second country is needed.
