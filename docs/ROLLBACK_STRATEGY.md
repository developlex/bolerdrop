# ROLLBACK_STRATEGY.md

Status: DRAFT
Scope: Rollback conditions, guarantees, and constraints
Type: Contractual (non-implementation)
Freeze: Not applied

## 1. Purpose

This document defines the rollback strategy for the platform.

Its goals are to:

- make rollback a first-class, planned operation,
- guarantee fast recovery from failed deployments,
- prevent ad-hoc or destructive recovery actions.

This document does not:

- prescribe rollback tooling,
- define infrastructure commands,
- describe database recovery mechanics.

## 2. Definition of Rollback

A rollback is defined as:

A controlled transition of a runtime system from a newer version to a previously known, healthy version using immutable artifacts.

Rollback is not:

- hotfixing,
- patching live systems,
- manual intervention.

## 3. When Rollback Is Required

Rollback must be initiated when any of the following occur:

- deployment verification fails,
- smoke tests fail,
- system health degrades post-deploy,
- Definition of Done is violated,
- runtime behavior deviates from expected guarantees.

Delaying rollback for investigation is not allowed unless explicitly justified.

## 4. Rollback Scope

Rollback applies to:

- storefront applications,
- backend services,
- shop agents,
- control plane components.

Rollback does not apply to:

- persistent data correction,
- manual data recovery,
- external systems.

## 5. Rollback Preconditions

Rollback may only be executed if:

- a previous released version exists,
- the previous version is known to be healthy,
- the rollback target is explicitly identified.

Rollback to an unknown or unverified version is forbidden.

## 6. Rollback Execution Guarantees

Rollback must satisfy the following guarantees:

- execution via CI/CD only,
- no manual runtime changes,
- no modification of persistent data,
- deterministic behavior,
- idempotent execution.

Rollback must restore the system to a known-good state.

## 7. Rollback Time Constraints

Rollback must complete within a bounded time window.

Target: `R <= 5 minutes`

Exceeding the rollback time target is considered a failure condition and must be investigated.

## 8. Post-Rollback Verification

After rollback:

- smoke tests must be executed,
- system health must be re-verified,
- operators must confirm restored availability.

Rollback is not complete until verification passes.

## 9. Prohibited Rollback Actions

During rollback, the following are strictly forbidden:

- database manipulation,
- data migrations,
- secret rotation as part of rollback,
- manual patching,
- partial rollbacks.

Rollback must be atomic at the component level.

## 10. Rollback Visibility & Auditability

Each rollback operation must record:

- trigger reason,
- target version,
- execution timestamps,
- final outcome.

Operators must be able to answer:

"Why was rollback executed, and to which version?"

## 11. Failure Handling During Rollback

If rollback itself fails:

- the incident must be escalated,
- no further changes are applied,
- manual intervention requires explicit incident handling.

Repeated rollback attempts without analysis are forbidden.

## 12. Relationship to Other Documents

This document is authoritative for:

- `RUNBOOK.md`
- `DEPLOYMENT_PIPELINE.md`

This document depends on:

- `CI_CD_OVERVIEW.md`
- `DEFINITION_OF_DONE.md`
- `SMOKE_TESTS.md`
- `SECURITY_MODEL.md`

In case of conflict, security and Definition of Done take precedence.

## 13. Change Management

Changes to rollback strategy:

- must be documented,
- require an ADR entry,
- must not weaken rollback guarantees.

## 14. Document Status

This document is DRAFT

No freeze applied

Rollback guarantees are binding once accepted

Implementation must conform

End of document
