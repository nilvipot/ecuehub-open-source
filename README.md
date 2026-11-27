# ECUE Hub Open Source

Open-source equestrian tools for dressage education, training and competition analysis.

A small, framework-independent TypeScript library maintained by the creator of [ECUE Hub](https://ecuehub.es). It helps developers build practice scorecard calculators and descriptive competition logs without requiring an account, database, API key or access to ECUE Hub.

## Why this exists

A score of 7 for a coefficient-two movement contributes differently from a score of 7 for a coefficient-one movement. Missing scores must not become zeroes, eliminated entries must not enter a mean, and results from different tests should not be pooled without context. This library makes those choices explicit and testable.

It is an independent companion project, not the ECUE Hub application. It contains newly written generic code and synthetic examples. No commercial report engine, private records, federation test sheets or production integrations are distributed.

## Features

- Calculate weighted technical scorecards and show each judge's points and percentage.
- Apply an explicitly supplied penalty in percentage points.
- Describe each movement's mean mark, judge spread and unearned contribution to the maximum score.
- Summarize starts, completions, scored results, wins, podiums and percentages separately for each caller-defined test group.
- Produce chronological score observations without changing the input.
- Parse dot/comma decimal percentages with explicit conventions and strict validation.
- Use typed ESM exports with zero runtime dependencies, no network calls and no telemetry.

## Requirements and installation

Node.js 24.12 or later, npm and Git. There is no claimed npm registry release. Install from a local checkout:

```sh
git clone https://github.com/nilvipot/ecuehub-open-source.git
cd ecuehub-open-source
npm ci
npm run check
npm pack
```

In a consuming project, install the resulting archive using its actual path:

```sh
npm install /path/to/ecuehub-open-source/ecuehub-open-source-1.0.0.tgz
```

The archive contains compiled JavaScript and TypeScript declarations. Consumers do not need TypeScript at runtime. Source modules have no Node-specific dependencies and may also be used through a browser bundler; automated browser compatibility testing is not yet provided.

## Quick start

```js
import { analyzeScorecard, parsePercentage, summarizeByTest } from 'ecuehub-open-source';

// Invented practice movements, not an official test.
const analysis = analyzeScorecard(
  [{ id: 'entry', coefficient: 1 }, { id: 'walk', coefficient: 2 }],
  [
    { id: 'C', marks: { entry: 7, walk: 8 } },
    { id: 'E', marks: { entry: 6, walk: 7 } },
  ],
  { penaltyPercentagePoints: 2 },
);
console.log(analysis.finalPercentage); // approximately 69.6666666667

const results = [{
  id: 'practice-1', date: '2026-06-01', testId: 'practice-v1',
  status: 'finished', percentage: parsePercentage('69,667', ','), place: null,
}];
console.log(summarizeByTest(results).get('practice-v1')?.meanPercentage);
```

Hand calculation: judge C earns `7 + 2 × 8 = 23` out of `30`; judge E earns `6 + 2 × 7 = 20` out of `30`. The mean is `(23/30 + 20/30) × 100/2 = 71.666…%`. Subtracting two percentage points gives `69.666…%`. Calculations retain floating-point precision; callers choose display rounding.

Run the complete synthetic example with `npm run example` after building.

## Interpretation and boundaries

This is educational arithmetic, not certified competition scoring. Penalties are supplied by the caller: there is no automatic elimination, federation rule lookup, tie-break, artistic/freestyle weighting, young-horse formula or official ranking. A negative final value is preserved rather than silently clipped. The result-log API accepts only percentages from 0 to 100; decide how an out-of-range practice calculation should be represented before creating a competition record.

All judge cards must contain every supplied movement exactly once, with marks from 0 to 10. Continuous decimal marks are accepted; this library does not enforce rule-specific mark increments. Coefficients may range from 0.001 to 100. Arrays are capped at 10,000 entries each; scorecard work is proportional to movements multiplied by judges. Apply lower limits when handling untrusted uploads.

`testId` must distinguish test versions, scoring methods and other relevant conditions. Even within one group, different judges, venues and sample sizes limit comparisons. Descriptive statistics cannot establish improvement, judge bias, horse welfare, readiness or a training prescription. Unearned points describe arithmetic headroom, not a promise of achievable improvement.

## Development

| Command | Purpose |
| --- | --- |
| `npm run check` | Type checking, build, tests, example and source scan |
| `npm run test:coverage` | Native Node coverage report after building |
| `npm run audit:source` | Check the explicit publication file list for common leaks |
| `npm pack --dry-run` | Inspect the consumer package contents |

CI runs on Node 24 and 26. `npm test` runs against `dist`, so build after changing source. A lockfile pins the only development dependency, TypeScript. The source scan is a limited heuristic, not proof that no secret can exist.

See [API and formulas](docs/api.md), [architecture](docs/architecture.md), [provenance](docs/provenance.md), [contribution guidance](CONTRIBUTING.md), [security reporting](SECURITY.md) and the [changelog](CHANGELOG.md).

## Project status and license

Version 1.0.0. The public CI matrix has passed on Node.js 24 and 26. No external adoption, download counts or impact metrics are claimed. MIT licensed; ECUE Hub names and trademarks are not licensed as branding rights. No affiliation with or approval by a federation or Anthropic is implied.
