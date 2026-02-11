# DEFINITION_OF_DONE.md

Status: DRAFT  
Scope: Platform-wide Definition of Done  
Type: Contractual (measurable)  
Freeze: Not applied

## 1. Purpose

This document defines what "done" means for the platform and its core workflows.

Its goals are to:

- make completion measurable and verifiable,
- prevent ambiguous "almost done" states,
- align operators, agents, and reviewers on acceptance criteria.

This document does not:

- prescribe implementation details,
- optimize performance or cost,
- replace testing strategy documents.

## 2. Scope of Definition

The Definition of Done applies to:

- platform-level capabilities,
- store provisioning workflows,
- deployment and rollback operations,
- documentation completeness.

Partial compliance is considered not done.

## 3. Core Outcome: "New Store in Minutes"

A store provisioning workflow is considered Done only if all criteria below are met.

### 3.1 Time-to-Provision (TTP)

Target: `T <= 10 minutes`

Measurement starts: provisioning command accepted

Measurement ends: store reported healthy and accessible

TTP must be observable and recorded.

### 3.2 Required Post-Provision State

At completion, the following must be true:

- Control Plane reports the store as healthy
- Shop Agent endpoint is reachable and healthy
- Storefront endpoint responds successfully
- Magento Admin endpoint is reachable
- No manual steps were required

Failure of any item invalidates completion.

### 3.3 Smoke Test Requirements

The following smoke checks must pass:

- storefront page load
- basic data query (e.g., product or catalog)
- agent health check
- platform-level status check

Smoke tests must be:

- automated,
- executed immediately after deployment,
- recorded as part of the provisioning run.

## 4. Deployment Completion Criteria

A deployment is considered Done only if:

- deployment was executed via CI/CD
- immutable artifacts were deployed
- no manual runtime changes were performed
- post-deploy smoke tests passed
- deployment status is visible to operators
- first-party code changes included and passed required automated tests

Manual fixes invalidate the deployment.

## 5. Rollback Definition of Done

Rollback is considered Done only if:

- rollback target version is explicitly selected
- rollback completes within `R <= 5 minutes`
- post-rollback smoke tests pass
- system returns to a known healthy state

Rollback must not require:

- database access,
- data manipulation,
- secret rotation.

## 6. Documentation Completeness

A feature or capability is considered Done only if:

- relevant documentation exists in /docs
- documentation reflects current behavior
- no undocumented behavior is introduced

Undocumented features are considered non-existent.

## 7. Operational Visibility

Completion requires visibility of:

- provisioning time
- deployment version
- current health state
- last successful action

If operators cannot observe the result, it is not done.

## 8. Failure Conditions (Explicit)

The following conditions explicitly mean Not Done:

- manual intervention required
- partial test success
- missing documentation
- unclear rollback path
- violation of Control Plane authority boundaries
- violation of isolation rules

## 9. Relationship to Other Documents

This document is authoritative for:

- RUNBOOK.md
- CI_CD_OVERVIEW.md
- DEPLOYMENT_PIPELINE.md
- SMOKE_TESTS.md

This document depends on:

- PROJECT_VISION.md
- ARCHITECTURE_DECISIONS.md
- ISOLATION_MODES.md
- CONTROL_PLANE_AUTHORITY.md

In case of conflict, this document defines acceptance.

## 10. Change Management

Changes to Definition of Done:

- must be documented,
- require an ADR entry,
- must not weaken existing guarantees without explicit approval.

## 11. Document Status

This document is DRAFT

No freeze applied

Metrics are binding once accepted

Implementation must conform to these criteria

End of document
