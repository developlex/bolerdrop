# INSTALLATION.md

Status: DRAFT
Type: Installation & Bootstrap Contract
Scope: Local and non-production platform setup
Freeze: Not applied

## 1. Purpose

This document defines the installation and bootstrap process for the platform.

Its goals are to:

- describe how the platform is brought from an empty environment to a runnable state,
- establish a deterministic setup sequence,
- prevent undocumented or manual setup steps.

This document does not:

- provide shell commands or scripts,
- prescribe specific tool versions,
- describe production deployment.

## 2. Installation Philosophy

Installation follows these principles:

- installation is repeatable and deterministic,
- installation is environment-agnostic (local, dev, CI),
- no manual post-install steps are required,
- installation prepares the platform for CI/CD-managed operation.

If a step cannot be automated later, it must be explicitly documented here.

## 3. Installation Scope

The installation process covers:

- local developer setup,
- non-production environments,
- platform bootstrap for testing and validation.

It excludes:

- production hardening,
- live data migration,
- infrastructure provisioning beyond the local/runtime scope.

## 4. Pre-Installation Requirements (Conceptual)

Before installation begins, the following must be true:

- the repository is cloned from a trusted source,
- documentation contracts are accepted,
- required runtime dependencies are available (container runtime, etc.),
- no secrets are present in the repository.

Environment prerequisites are conceptual, not tool-specific.

For Magento runtime compatibility (conceptual baseline):

- PHP runtime profile must satisfy the selected Magento 2.4.x line,
- web server profile must be explicitly selected (Apache 2.4.x or Nginx),
- search backend profile must be selected (OpenSearch-compatible),
- database/cache profiles must be selected before first store provisioning.
- Magento source mode must be selected explicitly (Composer metapackage or Git source flow).
- If Composer mode is used, `repo.magento.com` credentials must be available at runtime (not committed).

Installation documentation must not assume Apache-only topology.

## 5. Installation Phases (High-Level)

Installation is divided into explicit phases.

Phases must be executed in order.

### Phase 0 - Documentation Acceptance

Purpose:

ensure the installer understands platform constraints.

Requirements:

- AGENT.md reviewed and accepted,
- core contracts reviewed (`SECURITY_MODEL.md`, `CI_CD_OVERVIEW.md`).

No system components are started in this phase.

### Phase 1 - Base Infrastructure Bootstrap

Purpose:

initialize shared runtime foundations.

Activities (conceptual):

- prepare container runtime environment,
- prepare shared networking layer,
- prepare base configuration templates.

Constraints:

- no business services started,
- no store instances created.

### Phase 2 - Control Plane Initialization

Purpose:

bring up the Control Plane in isolation.

Activities:

- start Control Plane runtime,
- initialize registry storage (conceptual),
- expose Control Plane interfaces.

Constraints:

- Control Plane must start without access to store secrets,
- Control Plane must not depend on any store runtime.

### Phase 3 - Shared Services Initialization

Purpose:

start services shared across store instances.

Examples (conceptual):

- reverse proxy / routing layer,
- shared observability endpoints.

Constraints:

- shared services must not embed store-specific configuration,
- shared services must not access store data.

### Phase 4 - Store Instance Provisioning (First Store)

Purpose:

create the first runnable store instance.

Activities:

- select isolation mode,
- instantiate store runtime containers,
- inject configuration via templates,
- fetch Magento package via Composer metapackage flow,
- initialize Shop Agent for the store.

Constraints:

- no secrets committed to version control,
- secrets injected at runtime only,
- store must be independently startable.

### Phase 5 - Store Validation

Purpose:

verify that the store instance is operational.

Activities:

- run store-local smoke tests,
- verify storefront reachability,
- verify Shop Agent health.

Completion criteria:

- smoke tests pass,
- store reports healthy state.

Definition of success is governed by:

- `DEFINITION_OF_DONE.md`
- `SMOKE_TESTS.md`

### Phase 6 - Multi-Store Expansion (Optional)

Purpose:

add additional store instances.

Activities:

- repeat provisioning for new store IDs,
- ensure no shared state leakage,
- validate isolation guarantees.

Each store must be independently manageable.

### Automated Multi-Store Bootstrap Profile (Local/Non-Production)

For local bootstrap, the platform supports a single-command profile that:

- accepts an instance count,
- allocates available host ports per store automatically,
- creates `instances/<store-id>/` runtime files from shared templates,
- injects runtime-only values into local `.env` files,
- starts each requested store runtime slice in sequence.

This profile must remain:

- deterministic,
- idempotent on re-run,
- free of committed secrets.

Reference command shape (placeholder form):

```bash
make platform-bootstrap INSTANCES=<instance-count>
```

## 6. Configuration Handling

Rules:

- configuration templates may exist in the repository,
- real configuration values must never be committed,
- secrets are injected via approved mechanisms only.

Secrets handling is governed by:

`SECRETS_MANAGEMENT.md`

## 7. Failure Handling During Installation

If installation fails at any phase:

- the failure must be visible,
- partial installations are considered invalid,
- cleanup or reset must be possible.

Manual fixes invalidate the installation process.

## 8. Installation Idempotency

Installation must be:

- safe to re-run,
- not create duplicate state,
- able to recover from partial failure.

Idempotency is a hard requirement.

## 9. Post-Installation State

After successful installation:

- Control Plane is reachable,
- at least one store instance is healthy,
- storefront is accessible,
- operational visibility is available.

No manual steps are required post-install.

## 10. Non-Goals

This document does not define:

- production infrastructure setup,
- scaling strategies,
- backup/restore procedures,
- CI/CD pipeline configuration.

These are covered elsewhere.

## 11. Relationship to Other Documents

This document is authoritative for:

- installation and bootstrap expectations

This document depends on:

- `PROJECT_STRUCTURE.md`
- `CI_CD_OVERVIEW.md`
- `SECURITY_MODEL.md`
- `SECRETS_MANAGEMENT.md`
- `DOCKER_ORCHESTRATION_MODEL.md` (conceptual)

In case of conflict:

security and authority documents take precedence.

## 12. Change Management

Changes to installation flow:

- must be documented here,
- require an ADR if architectural,
- must preserve repeatability guarantees.

## 13. Document Status

This document is DRAFT

No freeze applied

Installation phases are binding once accepted

Implementation must conform

End of document
