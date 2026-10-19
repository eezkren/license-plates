# ADR 0003: Bulgaria only

**Date:** 2026-10-19
**Status:** Accepted

## Context

Every country has its own plate formats and nobody maintains them in one place, as libphonenumber does for phone numbers. The one npm package that covers Bulgaria among others (reviewed 2026-10-10) accepts any Latin letter and does not know Cyrillic, which is the gap this package fills.

A package that claims many countries and keeps none of them current does more harm than one that does one country properly: a wrong rule is a refused customer or a false warning, and nobody can tell which rules were checked.

## Decision

1. **The package covers Bulgaria and nothing else.** Its question is „can this plate be Bulgarian, and of which kind“. For anything else the answer is `unrecognised`, which means "not a Bulgarian format", not "not a plate".
2. **Every rule is read from the primary source** (the МВР regulations, МВР's own pages), with the provision cited next to the code and in docs/sources.md. Secondary descriptions such as Wikipedia are hints for what to look for, never the source, and nothing is copied from them (their CC BY-SA licence would bind this package).
3. **Another country is added only when a real user needs it,** checked the same way, in its own module. MotoManager asks for it first (MOTO-496).

## Consequences

- `classify` never says a plate is Romanian or German. A caller that needs the country asks the person, which is what a workshop can actually know.
- The package stays small enough to keep current. When МВР changes a format, one module changes, with its citation.

## Alternatives considered

- **Several countries from the start, from Wikipedia's tables.** Faster to write, impossible to vouch for, and incompatible with the MIT licence.
