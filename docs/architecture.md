# Architecture

The public package consists of four small internal modules and one export boundary:

| Module | Responsibility |
| --- | --- |
| `validation.ts` | Finite numbers, IDs, bounded arrays, objects and calendar dates |
| `parsing.ts` | Explicit locale decimal parsing |
| `scoring.ts` | Complete technical-scorecard arithmetic |
| `results.ts` | Validated descriptive summaries and chronological observations |
| `index.ts` | Stable public exports and types |

There are no adapters for databases, federations, payments, authentication, AI services or ECUE Hub. This keeps the package reusable in a CLI, application backend or bundled UI. Future integrations should live outside the arithmetic core.

TypeScript strict mode, unchecked-index checks and exact optional-property semantics are enabled. Runtime validation protects JavaScript callers as well. The package builds to ESM JavaScript and declaration files. Public API changes follow semantic versioning; behavior changes must include tests and documentation.

The Node test runner checks known arithmetic answers, metamorphic invariants, missing-data semantics, input immutability and malformed inputs. CI checks Node 24 and 26, runs source inspection and verifies the package manifest. The initial public CI matrix passed on Node.js 24 and 26. Browser support is an architectural aim, not an independently tested compatibility claim.

Floating-point arithmetic is used; this is unsuitable as an authoritative official results system without a separately verified rule and rounding layer. Complexity is O(movements × judges) for scoring and O(n log n) for histories. Per-array bounds do not replace application-level resource limits.
