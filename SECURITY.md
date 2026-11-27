# Security policy

The current 1.x line is the intended supported line once released. There is no security response SLA.

Use GitHub's **Security → Report a vulnerability** if private vulnerability reporting is enabled on the public repository. If that option is unavailable, request a private disclosure channel from the maintainer without describing the vulnerability publicly. Never disclose credentials, exploit details or personal records in public issues.

Include the affected version, a minimal synthetic reproduction, expected and actual behavior, and the likely impact. Allow time for investigation and coordinate publication with the maintainer.

The library does not access files, networks, accounts or environment variables at runtime. It accepts structured values and returns arithmetic results. Runtime validation rejects malformed dates, missing or invalid scores, duplicate identifiers and inconsistent result statuses. These checks are not an authorization system or a general sandbox.

Consumers must validate upload sizes, authenticate access to their own records, protect personal information and escape displayed text in their UI. Bound both scorecard dimensions: processing cost is O(movements × judges). Do not pass arbitrary executable objects, getters or proxies from an untrusted JavaScript execution context.

`npm run audit:source` checks a fixed publication list against common secret patterns and private-file conventions. It cannot establish the absence of all secrets. Review the complete file list and provenance before every release. Runtime dependencies: none. Development dependency: TypeScript (Apache-2.0).
