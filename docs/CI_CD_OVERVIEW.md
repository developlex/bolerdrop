# CI_CD_OVERVIEW.md

Status: DRAFT
Scope: Continuous Integration & Continuous Deployment model
Type: Contractual (non-implementation)
Freeze: Not applied

## 1. Purpose

This document defines the CI/CD model for the platform.

Its goals are to:

- establish CI/CD as a core architectural component,
- prevent manual or ad-hoc deployment paths,
- ensure repeatable, auditable, and reversible changes.

This document does not:

- prescribe CI/CD tooling,
- define pipeline implementation details,
- include environment-specific configurations.

## 2. CI/CD as an Architectural Invariant

CI/CD is not optional.

Core rule:

All changes to runtime systems must flow through CI/CD.

Any change applied outside CI/CD is considered:

- invalid,
- unsupported,
- a violation of platform contracts.

## 3. Scope of CI/CD

CI/CD applies to:

- storefront applications,
- backend services,
- control plane components,
- shop agents,
- infrastructure templates used for deployment.

CI/CD does not apply to:

- runtime state under `/instances`,
- external systems not owned by the platform.

## 4. Separation of Pipelines

CI/CD pipelines are logically separated by deployable unit.

At minimum:

- storefront pipeline
- backend (Magento extensions / services) pipeline
- shop agent pipeline
- control plane pipeline

Pipelines must not:

- deploy unrelated components,
- implicitly modify other systems.

## 5. CI Phase (Integration)

The CI phase is responsible for:

- validating changes before deployment,
- preventing broken artifacts from reaching runtime,
- producing immutable deployable outputs.

CI responsibilities include:

- static checks
- test execution (as defined elsewhere)
- artifact creation
- version identification

CI must fail fast on contract violations.

For first-party code changes, CI must enforce:

- required automated tests are present and executed,
- pull-request checks pass before merge to protected branches.
- pull request description includes explicit `What changed` and `Why` sections.

## 6. CD Phase (Deployment)

The CD phase is responsible for:

- deploying validated artifacts,
- ensuring deterministic deployment behavior,
- enabling rollback without data manipulation.

CD responsibilities include:

- controlled rollout
- post-deploy verification
- status reporting

Deployment is declarative, not imperative.

## 7. Immutability Principle

All deployable artifacts must be:

- versioned,
- immutable,
- traceable to a source change.

Mutable runtime changes are forbidden.

Rollback must rely on previous immutable artifacts, not patching.

## 8. Environment Boundaries

CI/CD must respect environment separation:

- environments are explicit (e.g., dev, staging, prod),
- artifacts may be promoted between environments,
- environments must not drift independently.

Environment-specific configuration must not change artifact identity.

## 9. Secrets in CI/CD

CI/CD pipelines:

- may reference secrets,
- must not log secrets,
- must not persist secrets in artifacts.

Secrets handling rules are defined in:

`SECRETS_MANAGEMENT.md`

Violation of secrets rules invalidates the pipeline run.

## 10. Verification & Gates

CI/CD must enforce gates before declaring success.

Required gates include:

- successful CI completion,
- successful deployment execution,
- post-deploy smoke verification.

Optional gates may exist but must not weaken required ones.

## 11. Failure Handling

On failure:

- deployment must stop immediately,
- partial deployment is considered failure,
- system must remain in a recoverable state.

Failure handling must be:

- deterministic,
- observable,
- auditable.

## 12. Observability & Traceability

Each CI/CD run must provide:

- unique run identifier,
- associated source revision,
- associated artifact version,
- final status (success/failure).

Operators must be able to answer:

"What is running, and how did it get there?"

## 13. Relationship to Other Documents

This document is authoritative for:

- `DEPLOYMENT_PIPELINE.md`
- `RUNBOOK.md`
- `ROLLBACK_STRATEGY.md`
- `SMOKE_TESTS.md`

This document depends on:

- `PROJECT_STRUCTURE.md`
- `DEFINITION_OF_DONE.md`
- `SECRETS_MANAGEMENT.md`
- `GIT_WORKFLOW.md`

In case of conflict, this document overrides implementation.

## 14. Change Management

Changes to the CI/CD model:

- must be documented,
- require an ADR entry,
- must not introduce manual deployment paths.

## 15. Document Status

This document is DRAFT

No freeze applied

CI/CD is mandatory and binding

Implementation must conform

End of document
