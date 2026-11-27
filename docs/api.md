# API and formulas

All public exports are available through the package root. Full types are shipped as `dist/*.d.ts`. Functions are synchronous and do not mutate inputs. Invalid values throw `RangeError` or `TypeError`; callers should catch errors at an input boundary and display a useful message.

## analyzeScorecard(movements, cards, options?)

`Movement = { id: string, coefficient: number }`. IDs must be unique. `JudgeCard = { id: string, marks: Record<string, number> }`. Judge IDs must be unique. Marks must have exactly the movement keys as own enumerable properties. Blank or over-200-character IDs are rejected. Nonempty arrays up to 10,000 elements are accepted. Coefficients are finite in [0.001, 100]; marks are finite in [0, 10]. No assumptions about permitted federation increments are made.

For coefficient `c_i` and judge mark `m_ij`:

- Maximum points: `M = 10 × sum(c_i)`.
- Judge points: `P_j = sum(c_i × m_ij)`.
- Judge percentage: `100 × P_j / M`.
- Gross percentage: arithmetic mean of judge percentages, with equal judge weights.
- Final percentage: gross percentage minus `options.penaltyPercentagePoints` (default 0, finite in [0, 100]). Negative results are preserved.
- Judge spread: highest minus lowest judge percentage, in percentage points.
- Movement mean: mean of its marks across judges.
- Movement spread: highest minus lowest mark, in mark points.
- Available percentage points: `(10 − movement mean) × coefficient / M × 100`.

The latter contributions sum to `100 − grossPercentage`, within floating-point tolerance. They describe distance from perfect marks, not expected gains or coaching priorities. A spread does not demonstrate judge bias. Rounding is intentionally left to the caller. Cards, movements and summary figures are returned together; no official rank is produced.

## summarizeByTest(results)

`CompetitionResult = { id, date, testId, status, percentage, place }`. Every field is required. Dates are real calendar dates in `YYYY-MM-DD`, years 0001–9999. IDs must be nonempty strings of at most 200 characters and result IDs must be unique within the input. `testId` is caller-defined and must distinguish incompatible tests, rule versions and scoring methods.

| Status | Counts as a start | Percentage and place |
| --- | --- | --- |
| `finished` | Yes | Each may independently be null |
| `withdrawn` | Yes | Both must be null |
| `eliminated` | Yes | Both must be null |
| `disqualified` | Yes | Both must be null |
| `not-started` | No | Both must be null |

The withdrawal convention here means a withdrawal after starting. Represent a withdrawal before starting as `not-started`. Numeric percentages must be finite in [0, 100]. Place is null or a positive safe integer. This function consumes supplied placements; it does not resolve ties or validate an entire class ranking.

Returns a `ReadonlyMap<string, ResultSummary>` sorted by test ID with record, start, finished, scored, win and podium counts and mean/best/worst percentages. A podium is a supplied place of 1, 2 or 3 in a finished result. Null percentages are excluded; zero is retained. Missing aggregates are null, not zero. Empty input gives an empty map. Use `Object.fromEntries(map)` for JSON serialization; serializing a Map directly does not include its entries.

## scoreHistory(results, testId)

Validates all supplied results, filters scored finishes for one test, and returns `{ id, date, percentage }` observations sorted ascending by date then ID. It does not fit a trend, predict a score or claim improvement. An absent group yields an empty array.

## parsePercentage(input, decimal = '.')

Accepts a finite number in [0, 100] or a numeric string (at most 100 characters), optional surrounding whitespace and optional trailing `%`. Choose `','` explicitly for comma decimals. Thousands separators, scientific notation, signs, empty input and mixed conventions are rejected. `74` means 74 percent, not 0.74. No heuristic rescales marks out of ten.

```js
parsePercentage('74,250 %', ','); // 74.25
parsePercentage('74.250');       // 74.25
parsePercentage('74,250');       // throws, explicit convention required
```
