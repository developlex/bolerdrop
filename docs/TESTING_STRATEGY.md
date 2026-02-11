# TESTING_STRATEGY.md

Status: DRAFT
Scope: Platform-wide testing strategy
Type: Contractual (non-implementation)
Freeze: Not applied

## 1. Purpose

This document defines the testing strategy for the platform.

Its goals are to:

- establish clear testing layers and responsibilities,
- prevent over-reliance on any single test type,
- ensure failures are detected at the correct stage.

This document does not:

- prescribe testing frameworks or tools,
- define test implementation details,
- replace operational verification (smoke tests).

## 2. Testing Philosophy

Testing is treated as a risk management mechanism, not a quality badge.

Core principles:

- tests are layered, not duplicated,
- earlier tests are cheaper and faster,
- later tests are fewer but higher confidence,
- no single test layer is sufficient on its own.
- first-party code changes require corresponding automated tests.

## 3. Testing Layers Overview

The platform testing model consists of distinct layers, each with a specific purpose:

- Static Validation
- Unit Tests
- Integration Tests
- Smoke Tests
- Operational Verification

Each layer has:

- a defined scope,
- clear responsibilities,
- explicit boundaries.

## 4. Static Validation

### Purpose

Detect errors without executing the system.

### Scope

- configuration correctness,
- contract conformance,
- policy enforcement.

### Characteristics

- fast
- deterministic
- mandatory in CI

Static validation failures block all further stages.

## 5. Unit Tests

### Purpose

Validate individual components in isolation.

### Scope

- pure business logic,
- deterministic behavior,
- error handling paths.

### Boundaries

- no external systems,
- no network calls,
- no shared state.

Unit tests must not depend on runtime environment.

## 6. Integration Tests

### Purpose

Validate interaction between components.

### Scope

- service-to-service interaction,
- contract correctness,
- integration boundaries.

### Boundaries

- limited scope
- controlled environments
- no reliance on production data

Integration tests are fewer and slower than unit tests.

## 7. Smoke Tests

### Purpose

Validate basic system availability after change.

Smoke tests are defined in:

`SMOKE_TESTS.md`

Smoke tests:

- are mandatory,
- are non-destructive,
- provide a go/no-go signal.

Smoke tests are not a substitute for deeper testing.

## 8. Operational Verification

### Purpose

Ensure the system behaves correctly in operational context.

### Scope

- deployment behavior,
- rollback behavior,
- health reporting,
- observability signals.

Operational verification is tied to:

- `RUNBOOK.md`
- `DEFINITION_OF_DONE.md`

## 9. Test Ownership

Test responsibility is distributed:

- developers own unit and integration tests,
- CI/CD owns enforcement and execution,
- operators rely on smoke and operational verification.

No single role owns all testing layers.

## 10. Test Execution Rules

The following rules are mandatory:

- tests must be automated,
- tests must be repeatable,
- tests must be deterministic,
- flaky tests are treated as failures.
- first-party production code changes must not be merged without test additions/updates.
- vendor/third-party code imports are excluded from author-owned test obligations.
- static standards checks (typed contracts / banned anti-pattern gates) must pass before test execution.

Manual testing does not satisfy completion criteria.

Current command-level test execution order is documented in:

- `LOCAL_EXECUTION_FLOW.md`

## 11. Failure Handling

If tests fail:

- the pipeline must stop,
- partial success is considered failure,
- failures must be visible and traceable.

Bypassing tests invalidates the change.

## 12. Relationship to Definition of Done

A feature or change is not done unless:

- required tests pass at all applicable layers,
- smoke tests pass,
- operational verification passes.

Testing is a prerequisite for completion.

## 13. Prohibited Testing Practices

The following are forbidden:

- testing directly against production data,
- disabling tests "temporarily",
- introducing non-deterministic tests,
- relying solely on manual verification.

Violations invalidate compliance.

## 14. Relationship to Other Documents

This document is authoritative for:

- test expectations across the platform

This document depends on:

- `CI_CD_OVERVIEW.md`
- `DEFINITION_OF_DONE.md`
- `SMOKE_TESTS.md`
- `RUNBOOK.md`

In case of conflict, Definition of Done prevails.

## 15. Change Management

Changes to the testing strategy:

- must be documented,
- require an ADR entry,
- must not weaken existing guarantees.

## 16. Document Status

This document is DRAFT

No freeze applied

Testing requirements are binding once accepted

Implementation must conform

End of document
