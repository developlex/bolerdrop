# IMPLEMENTATION_ROADMAP.md

Status: DRAFT
Type: Execution Plan / Delivery Roadmap
Scope: Contract-to-code implementation sequence
Freeze: Not applied

## 1. Purpose

This document defines the implementation sequence that converts the documented platform contracts into runnable systems.

It provides:

- phase ordering,
- delivery milestones,
- minimum acceptance criteria per phase.

## 2. Roadmap Principles

- Implement highest-risk architecture boundaries first.
- Deliver vertically (end-to-end runnable slices), not isolated components.
- Enforce CI/CD and smoke gates from the first runnable release.
- Keep store isolation and control-plane authority constraints non-negotiable.

## 3. Phase Plan

### Phase 0 - Runtime Bootstrap Foundations

Deliver:

- non-empty base compose templates in `infra/docker/`
- working local bootstrap scripts in `infra/scripts/`
- validated `instances/*/.env.example` templating flow

Exit criteria:

- platform services can be started deterministically in local non-production mode
- restart/reset flow is reproducible

### Phase 1 - Control Plane Minimal Vertical Slice

Deliver:

- minimal Control Plane API with store registry and health endpoints
- minimal Control Plane UI status surface
- OpenAPI contract alignment for control plane endpoints

Exit criteria:

- can register/list store metadata
- control plane health is observable
- no store business-data access paths exist

### Phase 2 - Shop Agent Minimal Operational Boundary

Deliver:

- Shop Agent health/status endpoints
- allowlisted operational endpoints (`/ops/*`, `/verify/smoke`) per contract
- structured audit-safe response/error model

Exit criteria:

- Control Plane -> Shop Agent boundary is functional
- no direct Control Plane -> Magento path

### Phase 3 - First Store Provisioning Path

Deliver:

- first store instance boot flow (`shop-001`) with isolated runtime group
- per-store configuration injection
- store-local networking and health checks

Exit criteria:

- first store is independently startable/stoppable
- store isolation invariants hold

### Phase 4 - Storefront Data Path (GraphQL Contract Slice)

Deliver:

- storefront app baseline routes
- minimal GraphQL contract surfaces for catalog/product/cart read path
- frontend data-access layer respecting documented boundaries

Exit criteria:

- storefront reaches backend via documented GraphQL boundary
- no backend-internal direct access from frontend

### Phase 5 - CI/CD and Smoke-Gated Delivery

Deliver:

- non-empty workflows in `.github/workflows/`
- build/test/deploy pipeline scaffolding for each deployable unit
- automated smoke checks wired into post-deploy verification

Exit criteria:

- deployment success requires smoke pass
- deployment status and artifact version are observable

### Phase 6 - Rollback and Failure Recovery

Deliver:

- rollback path using previous immutable artifacts
- rollback verification + smoke re-check
- runbook-aligned failure handling states

Exit criteria:

- rollback completes within target bounds (per DoD objective)
- no manual runtime patching required

### Phase 7 - Observability, Security, and Integration Hardening

Deliver:

- health/log/metric/trace/audit signal baselines
- secret handling and security guardrails enforced in CI
- integration boundary scaffolding aligned to integration model

Exit criteria:

- operational triage is possible without business-data exposure
- critical contract violations fail fast in CI

## 4. Milestone Checkpoints

- M1: Control Plane + Shop Agent boundary operational
- M2: First isolated store boot + health complete
- M3: Storefront read path + GraphQL contract complete
- M4: CI/CD + smoke-gated deployment complete
- M5: Rollback + observability baseline complete

## 5. Governance Requirements

Each phase must:

- map implementation changes to authoritative docs,
- update contracts/ADRs when architecture changes,
- pass documented security/isolation constraints.

## 6. Relationship to Other Documents

This roadmap depends on:

- `DEFINITION_OF_DONE.md`
- `CI_CD_OVERVIEW.md`
- `DEPLOYMENT_PIPELINE.md`
- `ROLLBACK_STRATEGY.md`
- `SECURITY_MODEL.md`
- `SECURITY_THREAT_MODEL.md`
- `PROJECT_STRUCTURE.md`

In case of conflict, contractual architecture/security documents take precedence.

## 7. Document Status

This document is DRAFT

No freeze applied

Roadmap may evolve, but phase ordering intent must remain explicit.

End of document
