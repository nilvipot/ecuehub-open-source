# Provenance and scope

This independent companion to [ECUE Hub](https://ecuehub.es) contains newly written generic arithmetic and validation code. It is not an export of the ECUE Hub application or its repository history.

The initial scope was informed by a read-only review of ECUE Hub's module boundaries. Authentication, payments, commercial reports, proprietary relative-performance analysis, private training schedules, imports linked to production storage, personal records, internal documentation and branding assets are excluded. No original application source files, data fixtures, schema migrations or commit history are included.

Generic result-counting semantics were reconsidered for this package: types are independent, invalid inputs fail explicitly, missing scores stay missing, and comparison groups are mandatory. Weighted movement calculations are a complementary educational tool. All examples and test data were invented for this project.

## Rights and dependencies

- New project source and documentation: released by the maintainer under MIT.
- Runtime dependencies: none.
- Development compiler: TypeScript 5.9.3, Apache-2.0; installed from its published package, not vendored into the repository.
- CI actions: referenced by pinned commit, not copied or vendored.
- No copied federation test sheets, training manuals, databases, logos, images or other third-party content.

The maintainer must have authority to license submitted code. New contributions must identify any third-party material and its compatible license before merge. Public accessibility of a dataset or test sheet does not grant redistribution rights.

For educational background, see [FEI's dressage scoring introduction](https://www.fei.org/stories/lifestyle/teach-me/dressage-scoring-basics). It is not incorporated into the distribution or treated as a current rule engine. Penalty policies, permitted increments, official rounding and ties must be checked separately against the applicable event rules.
