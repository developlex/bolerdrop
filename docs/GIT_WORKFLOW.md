# GIT_WORKFLOW.md

Status: DRAFT
Type: Governance / Delivery Workflow
Scope: Branching, pull-request flow, and merge controls
Freeze: Not applied

## 1. Purpose

This document defines the mandatory Git workflow for the repository.

Its goals are to:

- enforce a predictable branch model,
- require reviewable pull-request based delivery,
- prevent direct unreviewed changes to stable branches.

## 2. Branch Model

The repository uses the following long-lived branches:

- `master`: production-ready stable branch
- `dev`: integration branch for accepted feature work

Short-lived branches:

- `feature/<scope>-<short-name>` for new work
- `fix/<scope>-<short-name>` for defect fixes
- `hotfix/<scope>-<short-name>` for urgent production corrections

Feature/fix/hotfix branches are temporary and must be deleted after merge.

## 3. Mandatory Flow

Required path for normal development:

1. Branch from `dev` into `feature/*` (or `fix/*`).
2. Implement changes and tests in the branch.
3. Open PR into `dev`.
4. Merge only after required checks pass.

Promotion flow:

1. Open PR from `dev` into `master`.
2. Merge only after release checks pass.

Direct commits to `master` and `dev` are forbidden.

## 4. Pull Request Rules

Every change must go through PR.

PR requirements:

- linked scope/intent in PR description,
- clear change summary with dedicated `What changed` section,
- explicit rationale with dedicated `Why this change is needed` section,
- test evidence for first-party code changes,
- CI checks green.

At least one reviewer approval is required before merge.

Repository pull request template must be used to enforce consistent reviewer context.

## 5. Test Coverage Requirement

For all first-party code (non-third-party):

- every change must include or update automated tests at the appropriate layer,
- untested first-party production code changes must be rejected in PR review,
- CI must run required test suites before merge.

Third-party vendor code is excluded from this requirement.

## 6. Merge Policy

Allowed merge strategy:

- squash merge (default) for feature/fix branches.

Rules:

- no force-push to `master` or `dev`,
- no bypass of required checks,
- no merge with failing CI.

## 7. Branch Protection (Repository Setting Requirement)

Repository settings must enforce for `master` and `dev`:

- require PR before merge,
- require status checks to pass,
- require at least one approval,
- restrict direct push access.

If settings and this document conflict, stricter controls apply.

## 8. Relationship to Other Documents

This document is authoritative for:

- git branching and PR flow governance

This document depends on:

- `CI_CD_OVERVIEW.md`
- `TESTING_STRATEGY.md`
- `DEFINITION_OF_DONE.md`
- `RUNBOOK.md`

In case of conflict, security and authority documents take precedence.

## 9. Change Management

Changes to git workflow:

- must be documented here,
- require ADR if they alter delivery governance materially,
- must not weaken PR/testing controls.

## 10. Document Status

This document is DRAFT

No freeze applied

Workflow rules are binding once accepted.

End of document
