# bg-license-plates

Bulgarian vehicle registration plates: normalise, check, classify and format, with every rule cited to the МВР regulation.

Used in production by MotoManager (motomanager.bg)

[![CI](https://github.com/eezkren/bg-license-plates/actions/workflows/ci.yml/badge.svg)](https://github.com/eezkren/bg-license-plates/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/bg-license-plates)](https://www.npmjs.com/package/bg-license-plates)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[Български](#български) · [English](#english)

```ts
import { check, classify, format, normalize } from "bg-license-plates";

normalize("св 1234 ах"); // "CB1234AX"
format("са-1234-вх"); // "CA 1234 BX"
classify("СА 1234 ВХ"); // { status: "bulgarian", kind: "regular", code: "CA", region: { name: "София (столица)", … }, … }
classify("B-XY 123"); // { status: "unrecognised", plate: "BXY123", display: "BXY123" }
check("СА 1234 БВ"); // { ok: false, reason: "impossible-characters", characters: ["Б"], … }
```

Zero runtime dependencies, ESM with TypeScript types, published with npm provenance. Every plate in the examples and tests is invented.

---

## Български

Номерът на колата често е единственият ѝ идентификатор, а хората го пишат различно: на кирилица или на латиница, с малки букви, с интервали, с тирета. „СА 1234 ВХ“ на българска клавиатура и „CA 1234 BX“ на английска изглеждат еднакво, но са различни низове. Този пакет ги свежда до една форма, казва дали номерът може да е български и от какъв вид, и го показва по един начин.

Въпросът, на който отговаря, е **„на коя държава може да е този номер“**, не „валиден ли е“. Пакетът знае форматите, в които МВР издава номера, не кои номера са издадени. Номер, който не пасва на български формат, може да е чужд, затова отговорът е предупреждение, не отказ. Отказ има само за знаци, които не може да ги има на номер.

### Инсталиране

```sh
npm install bg-license-plates
```

### Функции

| Функция          | Отговаря на                                                                                                                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normalize(raw)` | Формата за пазене и сравнение: главни латински букви, без интервали и тирета. 12-те кирилски букви на номерата стават латинските, на които приличат (А→A, В→B, Е→E, К→K, М→M, Н→H, О→O, Р→P, С→C, Т→T, У→Y, Х→X).                                                     |
| `check(raw)`     | Може ли изобщо да е номер. Отказва празен номер (или само тирета) и номер с кирилска буква извън 12-те (`reason: "impossible-characters"` и самите букви). Всичко друго минава.                                                                                       |
| `classify(raw)`  | Може ли да е български номер и от какъв вид. `status` е `"bulgarian"` (с `kind` и частите на номера), `"unrecognised"` (не е български формат, предупреждение) или `"invalid"` (това, което `check` отказва). Всеки разпознат номер носи `basis`, члена от наредбата. |
| `format(raw)`    | Единственият начин за показване: „CA 1234 BX“. Разпознат номер се разделя така, както е на табелата; всичко останало се показва нормализирано.                                                                                                                        |

Освен тях: `REGIONS` (кодът на всяка област), `LEGAL_BASIS` (основанието за всеки вид), `CYRILLIC_TO_LATIN` и `PLATE_LETTERS`.

### Видове номера

| `kind`         | Формат                                                                                 | Пример              | Основание                                                                                 |
| -------------- | -------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `regular`      | код на областта (1–2 букви), 4 цифри, серия (1–2 букви)                                | СА 1234 ВХ          | Наредба № I-45, чл. 24, ал. 1 и 2                                                         |
| `trailer`      | като `regular`, серията започва с Е                                                    | ЕВ 1234 ЕН          | практика на ГДНП, **непотвърдена** в първоизточник (чл. 24, ал. 2 оставя сериите на ГДНП) |
| `electric`     | ЕА (автомобил) или ЕМ (мотоциклет), 4 цифри, серия; зелени знаци                       | ЕА 1234 ВК          | чл. 23, ал. 4 и чл. 24, ал. 2; ЕА е в бележки на МВР, ЕМ **не е потвърден**               |
| `personalised` | код на областта и 6 букви или цифри по избор                                           | СА МОТОР1           | чл. 24, ал. 6–8                                                                           |
| `transit`      | 6 цифри, разделени с Т, Н или М; 5 цифри с М за категория L                            | 123 Т 456, 85 М 528 | чл. 29, ал. 3                                                                             |
| `dealer`       | 6 цифри, разделени с В; 5 цифри за категория L                                         | 198 В 229           | чл. 30, ал. 2                                                                             |
| `foreigner`    | ХХ или ХН и 4 цифри                                                                    | ХХ 1234             | Наредба № I-181, чл. 17, ал. 1, т. 2                                                      |
| `military`     | ВА и 6 цифри                                                                           | ВА 123456           | Наредба № Н-13 от 2004 г. на МО, по описанието на МВР; Наредба № I-45, чл. 31             |
| `diplomatic`   | С (дипломатически), СС (консулски), СТ (административно-технически персонал) и 4 цифри | СС 1234             | Наредба № I-181, чл. 17, ал. 1, т. 1 и ал. 2                                              |

Когато един низ пасва на два формата, печели по-конкретният: „С1234АВ“ е обикновен номер на София, а не личен. Пълният ред е в коментара на `classify`.

Всяко правило е прочетено от първоизточника на 2026-10-19: наредбите на МВР и страниците на МВР. [docs/sources.md](docs/sources.md) цитира всеки член, дава връзка към текста и посочва за всяка област бележката на областната дирекция, която показва кода ѝ. Уикипедия е ползвана само като подсказка какво да се търси; от нея не е копирано нищо.

### Решения

- [ADR 0001](docs/adr/0001-unrecognised-is-a-warning-not-a-refusal.md): непознат формат е предупреждение, не отказ.
- [ADR 0002](docs/adr/0002-cyrillic-is-stored-as-latin.md): номерът се пази на латиница, на каквато и азбука да е написан.
- [ADR 0003](docs/adr/0003-bulgaria-only.md): само България.

### Какво не е уточнено

- **Кодовете на областите** не са в наредбата: чл. 24, ал. 2 ги оставя на ГДНП, която не публикува списъка. За 13 от 28 области кодът е потвърден в бележка на областната дирекция на МВР; останалите са дългогодишните кодове.
- **Серия Е за ремаркета** и **кодът ЕМ** не са в нито един публикуван текст на МВР. Затова `trailer` значи „вероятно ремарке“; за въпроса „български ли е“ разликата няма значение.
- **Цифрите** на дипломатическите номера и на ХХ/ХН не са в наредбата; четирите цифри са от образците на МВР. Нямаме образец на ХН.
- **Двуредовите табели** (мотоциклети, квадратни табели) се четат „РВ А / 3579“, но номерът е „РВ 3579 А“. Номер, въведен в реда на четене, излиза като непознат.
- **Третата табела** (чл. 10, ал. 9) повтаря номера на колата с допълнителна цифра. Пакетът не я разпознава нарочно: идентификаторът на колата е основният номер.

### Разработка

```sh
npm ci
npm test               # unit, property-based и parity тестове
npm run test:mutation  # мутационно тестване със Stryker
npm run lint && npm run typecheck && npm run build
```

Тестовете са три вида: примери за всеки вид номер и всяка граница на формата; свойства с [fast-check](https://fast-check.dev) (всеки генериран номер от всеки вид, написан по какъвто и да е начин, се чете като този вид и се показва обратно); и съвпадение с правилата, които MotoManager ползваше преди пакета, върху произволен Unicode. Мутационният резултат е 100% (вижте `reports/mutation/` след `npm run test:mutation`).

Номер на кола е свързан с човек, значи е лични данни. В репото няма нито един истински номер: всички примери са измислени във валиден формат.

### Лиценз

[MIT](LICENSE) © Iskren Ivanov

---

## English

A car's plate is often its only identifier, and people type it in many ways: in Cyrillic or Latin, in lower case, with spaces, with dashes. „СА 1234 ВХ“ typed on a Bulgarian keyboard and „CA 1234 BX“ typed on an English one look the same and are different strings. This package reduces them to one form, says whether a plate can be Bulgarian and of which kind, and shows it one way.

The question it answers is **"which country can this plate be from"**, not "is it valid". The package knows the formats МВР (the Ministry of Interior) issues plates in, not which plates were issued. A plate that fits no Bulgarian format may be foreign, so the answer is a warning, not a refusal. The only refusal is for characters no plate can have.

### Install

```sh
npm install bg-license-plates
```

### Functions

| Function         | Answers                                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normalize(raw)` | The form to store and compare: Latin capitals, no spaces or dashes. The twelve Cyrillic plate letters become the Latin letters they look like (А→A, В→B, Е→E, К→K, М→M, Н→H, О→O, Р→P, С→C, Т→T, У→Y, Х→X).                                                                     |
| `check(raw)`     | Can it be a plate at all. Refuses an empty plate (or dashes only) and a plate with a Cyrillic letter outside the twelve (`reason: "impossible-characters"`, with the letters). Everything else passes.                                                                          |
| `classify(raw)`  | Can it be a Bulgarian plate, and of which kind. `status` is `"bulgarian"` (with `kind` and the plate's parts), `"unrecognised"` (not a Bulgarian format: a warning) or `"invalid"` (what `check` refuses). Every recognised plate carries `basis`, the provision it comes from. |
| `format(raw)`    | The one way to show a plate: "CA 1234 BX". A recognised plate is spaced as it is printed; anything else is shown normalised.                                                                                                                                                    |

Also exported: `REGIONS` (each region's code), `LEGAL_BASIS` (the provision for each kind), `CYRILLIC_TO_LATIN` and `PLATE_LETTERS`.

### Kinds of plate

| `kind`         | Format                                                                              | Example             | Source                                                                                     |
| -------------- | ----------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `regular`      | region code (1–2 letters), 4 digits, series (1–2 letters)                           | СА 1234 ВХ          | Наредба № I-45, чл. 24, ал. 1 и 2                                                          |
| `trailer`      | as `regular`, series begins with Е                                                  | ЕВ 1234 ЕН          | ГДНП practice, **not confirmed** in a primary source (чл. 24, ал. 2 leaves series to ГДНП) |
| `electric`     | ЕА (car) or ЕМ (motorcycle), 4 digits, series; green characters                     | ЕА 1234 ВК          | чл. 23, ал. 4 and чл. 24, ал. 2; ЕА appears in МВР notices, ЕМ is **not confirmed**        |
| `personalised` | region code and 6 letters or digits of the owner's choice                           | СА МОТОР1           | чл. 24, ал. 6–8                                                                            |
| `transit`      | 6 digits split by Т, Н or М; 5 digits around М for category L                       | 123 Т 456, 85 М 528 | чл. 29, ал. 3                                                                              |
| `dealer`       | 6 digits split by В; 5 digits for category L                                        | 198 В 229           | чл. 30, ал. 2                                                                              |
| `foreigner`    | ХХ or ХН and 4 digits                                                               | ХХ 1234             | Наредба № I-181, чл. 17, ал. 1, т. 2                                                       |
| `military`     | ВА and 6 digits                                                                     | ВА 123456           | Наредба № Н-13 of 2004 (Ministry of Defence), as МВР describes it; Наредба № I-45, чл. 31  |
| `diplomatic`   | С (diplomatic), СС (consular), СТ (administrative and technical staff) and 4 digits | СС 1234             | Наредба № I-181, чл. 17, ал. 1, т. 1 и ал. 2                                               |

Where one string fits two formats, the more specific wins: "С1234АВ" is a regular Sofia plate, not a personalised one. The full order is in the comment on `classify`.

Every rule was read from the primary source on 2026-10-19: МВР's regulations and its own pages. [docs/sources.md](docs/sources.md) quotes each provision, links the text, and for each region gives the notice of its police directorate that shows its code. Wikipedia was used only as a hint of what to look for; nothing is copied from it.

### Decisions

- [ADR 0001](docs/adr/0001-unrecognised-is-a-warning-not-a-refusal.md): an unrecognised plate is a warning, not a refusal.
- [ADR 0002](docs/adr/0002-cyrillic-is-stored-as-latin.md): a plate is stored in Latin letters, whatever alphabet it was typed in.
- [ADR 0003](docs/adr/0003-bulgaria-only.md): Bulgaria only.

### What is not settled

- **Region codes** are not in the regulation: чл. 24, ал. 2 leaves them to ГДНП, which does not publish its list. 13 of the 28 regions' codes are confirmed in a notice of their МВР directorate; the rest are the long-standing codes.
- **The Е series for trailers** and **the code ЕМ** appear in no published МВР text. So `trailer` means "probably a trailer"; for "can it be Bulgarian" the difference does not matter.
- **The digit counts** of diplomatic and ХХ/ХН plates are not in the regulation; the four digits come from МВР's specimens. There is no ХН specimen.
- **Two-row plates** (motorcycles, square plates) read "РВ А / 3579", but the number is "РВ 3579 А". A number typed in reading order comes back unrecognised.
- **The third plate** (чл. 10, ал. 9) repeats the car's number with an extra digit. It is not recognised on purpose: the car's identifier is its main number.

### Development

```sh
npm ci
npm test               # unit, property-based and parity tests
npm run test:mutation  # mutation testing with Stryker
npm run lint && npm run typecheck && npm run build
```

The tests are of three sorts: examples for every kind of plate and every edge of each format; properties with [fast-check](https://fast-check.dev) (every generated plate of every kind, typed any way, is read as that kind and printed back); and agreement with the rules MotoManager used before this package, over arbitrary Unicode. The mutation score is 100% (see `reports/mutation/` after `npm run test:mutation`).

A plate belongs to a car and through it to a person, so it is personal data. The repository holds no real plate: every example is invented in a valid format.

### License

[MIT](LICENSE) © Iskren Ivanov
