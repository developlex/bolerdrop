# SMOKE_TESTS.md

Status: DRAFT
Scope: Smoke test policy and acceptance criteria
Type: Contractual (non-implementation)
Freeze: Not applied

## 1. Purpose

This document defines the smoke test model for the platform.

Its goals are to:

- provide a minimal, mandatory confidence gate after deployment and rollback,
- detect critical runtime failures early and deterministically,
- prevent declaring success when core user and operator paths are broken.

This document does not:

- define test framework tooling,
- define full regression testing strategy,
- prescribe implementation-level test code.

## 2. Smoke Tests as a Release Gate

Smoke tests are mandatory.

Core rule:

No deployment or rollback is considered successful until required smoke tests pass.

A failed smoke test invalidates completion.

## 3. Scope

Smoke tests apply to:

- post-deploy verification,
- post-rollback verification,
- provisioning completion checks.

Smoke tests cover:

- platform-level availability signals,
- critical user-facing availability,
- critical operational boundaries.

## 4. Minimum Required Test Set

The minimum smoke suite must include:

- storefront page load check,
- basic catalog/product data query check,
- shop agent health check,
- platform/control-plane status check.

Additional checks may be added but must not replace required checks.

## 5. Execution Timing

Smoke tests must run:

- immediately after deployment,
- immediately after rollback,
- as part of provisioning completion verification.

Delayed or manual smoke checks do not satisfy this contract.

## 6. Environment Rules

Smoke tests must execute against the target deployed environment.

Rules:

- test environment target is explicit,
- environment identity is recorded,
- environment-specific configuration must not alter required test semantics.

## 7. Determinism Requirements

Smoke tests must be:

- deterministic,
- repeatable,
- auditable.

Test outcomes must not depend on manual interpretation.

## 8. Pass/Fail Contract

A smoke run is `PASS` only when all required checks pass.

A smoke run is `FAIL` when:

- any required check fails,
- a required check is skipped,
- the test run is incomplete or inconclusive.

Partial success is failure.

## 9. Failure Handling

When smoke tests fail:

- the deployment is unsuccessful,
- the runtime state is not considered "done",
- rollback evaluation is mandatory,
- incident handling must follow the runbook.

Smoke failures must be treated as production-significant until resolved.

## 10. Rollback Interaction

Smoke test outcomes directly influence rollback decisions.

Rollback must be considered when:

- post-deploy smoke tests fail,
- health degrades during smoke validation.

After rollback, smoke tests must pass before completion can be declared.

## 11. Observability & Traceability

Each smoke run must record:

- run identifier,
- associated deployment/rollback identifier,
- target environment,
- executed checks,
- per-check result,
- final run status,
- timestamps.

Operators must be able to reconstruct why a run passed or failed.

## 12. Prohibited Practices

The following are forbidden:

- marking deploy/rollback successful before smoke completion,
- skipping required checks "temporarily",
- manually overriding failed smoke outcomes,
- replacing smoke gates with ad-hoc human verification.

Violations invalidate operational compliance.

## 13. Relationship to Other Documents

This document is authoritative for:

- `RUNBOOK.md`
- `DEPLOYMENT_PIPELINE.md`
- `ROLLBACK_STRATEGY.md`

This document depends on:

- `DEFINITION_OF_DONE.md`
- `CI_CD_OVERVIEW.md`
- `SECURITY_MODEL.md`

In case of conflict, acceptance and security contracts override implementation behavior.

## 14. Change Management

Changes to smoke test requirements:

- must be documented,
- require an ADR entry if architectural guarantees are affected,
- must not weaken required gates.

## 15. Document Status

This document is DRAFT

No freeze applied

Smoke test gates are binding once accepted

Implementation must conform

End of document
