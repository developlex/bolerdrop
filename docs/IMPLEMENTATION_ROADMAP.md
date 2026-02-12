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

#### Phase 3 Immediate Task Breakdown

1. Add first-store bootstrap compose profile under `instances/shop-001/`:
   - include shop runtime placeholders,
   - include Shop Agent runtime,
   - keep all sensitive values runtime-injected only.
2. Wire deterministic startup script path in `infra/scripts/`:
   - bootstrap store runtime,
   - validate required runtime env placeholders,
   - fail fast on missing mandatory runtime injection.
3. Define first-store health contract checks:
   - storefront reachability check,
   - Shop Agent `/health` check,
   - Shop Agent authorized `/status` check.
4. Add CI validation for first-store provisioning path:
   - compose config validation,
   - container startup smoke,
   - teardown reliability check.
5. Add reset/recovery script alignment:
   - safe stop/remove flow,
   - no manual runtime mutation assumptions.
6. Document and verify bounded blast radius:
   - no cross-store network dependency,
   - no shared store secrets,
   - no control-plane bypass paths.

### Phase 4 - Storefront Data Path (GraphQL Contract Slice)

Deliver:

- storefront app baseline routes
- minimal GraphQL contract surfaces for catalog/product/cart read path
- frontend data-access layer respecting documented boundaries

Exit criteria:

- storefront reaches backend via documented GraphQL boundary
- no backend-internal direct access from frontend

#### Phase 4 Execution Tracker (Current)

Current stage:

- Phase 4 is active and in parity-hardening mode.
- Core catalog/cart/checkout/account/wishlist/newsletter surfaces are runnable.
- Remaining work is focused on cart mutation parity, checkout edge-case hardening, and end-to-end smoke coverage.

Completed:

- [x] Catalog listing and product detail routes wired through the GraphQL boundary.
- [x] Cart creation/add/read flows implemented with server actions and cart cookie scoping.
- [x] Customer sign-in/account read/sign-out flow wired through GraphQL token boundary.
- [x] Checkout readiness gate implemented for payment + shipping preconditions.
- [x] Guest checkout action now supports physical-cart shipping address + shipping method capture.
- [x] Order confirmation route added with structured order summary surface.
- [x] Customer registration flow implemented with account creation + auth handoff.
- [x] Customer account parity expanded (profile edit, password change, address CRUD, newsletter preferences, order history/detail, wishlist management).
- [x] Password UX aligned to Magento baseline for registration/account password forms (strength indicator, trim-aware minimum-length validation, visibility toggle controls).
- [x] Address mutation payload handling aligned to Magento GraphQL input expectations (structured input object + optional region handling).
- [x] Account server-action redirect handling hardened so successful Magento writes return success state instead of false service-failure messages.
- [x] Address save flow now resolves Magento `region_id` from country-region metadata to satisfy strict country/state validation requirements.
- [x] Password change flow now includes a token-based verification fallback for Magento false-negative internal-error responses.
- [x] Extension-injected attribute hydration noise (browser password managers) is suppressed on account form surfaces.

Needs to be done next:

- [ ] Persist and reuse a validated shipping profile for returning sessions.
- [ ] Implement cart mutation controls (update quantity + remove item).
- [ ] Add integration smoke check covering product -> cart -> checkout placement path.
- [ ] Add checkout fallback UX for carts where no shipping methods are returned.
- [ ] Add explicit GraphQL error-code mapping table for checkout failures in docs.

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
