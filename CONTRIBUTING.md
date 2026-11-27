# Contributing

Open an issue describing the concrete equestrian or developer problem before proposing a large feature. Small fixes may be submitted directly. Reports and pull requests should be in English.

1. Fork and clone the public repository. Use Node.js 24.12 or later.
2. Run `npm ci` and `npm run check`.
3. Create a branch and make a focused change. Preserve strict types and documented semantics.
4. Add a test with an independently calculated expected value or a meaningful failure case.
5. Update the API documentation and the Unreleased changelog where applicable.
6. Run `npm run check` and inspect `npm pack --dry-run` before opening a pull request.

Use synthetic fixtures only. Do not submit personal information, real athlete records, credentials, private ECUE Hub code, official test sheets or material you cannot license. Do not introduce a runtime dependency without explaining its necessity and license. Rule-specific features require primary references, a rule version and a clear separation from generic arithmetic.

The maintainer reviews correctness, usefulness, maintenance cost and rights before merging. Contributions are provided under the repository's MIT license; by submitting one, you confirm that you have the right to do so. No contribution license agreement is currently required. There is no promised response time.

Report suspected vulnerabilities using [SECURITY.md](SECURITY.md), not a public issue. Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
