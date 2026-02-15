# BoilerDrop

BoilerDrop is a multi-store commerce platform blueprint with strict separation between:

- store runtime instances,
- a centralized control plane,
- infrastructure templates,
- contractual documentation in `docs/`.

## Project Purpose

BoilerDrop exists to provide a reproducible, contract-driven foundation for running multiple isolated Magento store instances with minimal manual setup.

The project is designed to:

- bootstrap one or many store instances with deterministic runtime configuration,
- enforce security/isolation/authority boundaries as first-class constraints,
- support a decoupled storefront that can be enabled per instance without breaking Magento baseline operation,
- keep delivery auditable through PR-gated workflows and documented operational contracts.

This project is not a single-store custom theme repo; it is a multi-instance platform boilerplate and execution model.

## Current Status

- Documentation readiness gate is marked `READY` in `docs/DOCUMENTATION_AUDIT.md`.
- Implementation is in Phase 4 parity hardening (storefront/account/cart/checkout focus) per `docs/IMPLEMENTATION_ROADMAP.md`.
- Storefront coverage is tracked in `docs/STOREFRONT_FUNCTIONALITY_MATRIX.md`.
- Checkout now supports both guest and signed-in flows, with signed-in checkout prefilled from account email/default shipping address.

## Repository Map

- `docs/`: architecture, security, operations, and API contracts
- `backend/`: Magento runtime extensions and Shop Agent boundary service
- `frontend/`: decoupled storefront application
- `control-plane/`: platform orchestration API/UI
- `infra/`: Docker templates and automation scripts
- `instances/`: per-store runtime configuration templates
- `.github/`: workflows, PR template, and CODEOWNERS

## Governance and Delivery Rules

- Root authority: `AGENT.md`
- Branching/PR policy: `docs/GIT_WORKFLOW.md`
- `main`/`master`: protected, PR-only, no direct push
- `dev`: integration branch, direct push allowed

If docs and implementation diverge, higher-authority docs govern.

## Quick Local Bootstrap

Provision and launch multiple store instances:

```bash
make platform-bootstrap INSTANCES=<instance-count>
```

Provision-only (no runtime startup):

```bash
make platform-provision INSTANCES=<instance-count>
```

Core execution/validation order is maintained in:

- `docs/LOCAL_EXECUTION_FLOW.md`
- `docs/INSTALLATION.md`

## Storefront Runtime Controls

Per instance (`instances/<store-id>/.env`):

```bash
STOREFRONT_ENABLED=1
STOREFRONT_THEME=dropship
```

- `STOREFRONT_ENABLED=1`: run decoupled storefront container
- `STOREFRONT_ENABLED=0`: use Magento frontend only
- supported themes: `dropship`, `sunset`

Theme switching behavior:

- immediate switch in top-bar toggle (no manual refresh),
- persisted in `storefront_theme` cookie,
- optional direct-link override via `?theme=<id>`.

Debug active theme:

```bash
curl -fsS http://localhost:<storefront-port>/api/theme
```

Theme definitions are versioned under:

- `frontend/storefront/src/themes/themes.ts` (registry + tokens)
- `frontend/storefront/src/components/theme-switcher.tsx` (runtime switch UI)

After changing storefront runtime flags, rerun instance bootstrap/install for that store:

```bash
bash infra/scripts/install-magento.sh <store-id>
```

## Optional Catalog Seed Import (Shopify Source)

Generic importer script:

```bash
bash infra/scripts/import-shopify-products.sh <store-id> --limit <count> \
  --source-url "https://<shop-domain>/collections/<collection-handle>/products.json?limit=250&page=1"
```

Notes:

- source URL must be explicitly provided (placeholder values are rejected),
- SKU prefix defaults to `shopify-` (override with `SKU_PREFIX` env var when needed).

## Security and Contracts

Primary security contracts:

- `docs/SECURITY_MODEL.md`
- `docs/SECURITY_THREAT_MODEL.md`
- `docs/SECRETS_MANAGEMENT.md`
- `docs/CONTROL_PLANE_AUTHORITY.md`
- `docs/SHOP_AGENT_API.md`

Related platform contracts:

- `docs/CI_CD_OVERVIEW.md`
- `docs/DEPLOYMENT_PIPELINE.md`
- `docs/ROLLBACK_STRATEGY.md`
- `docs/TESTING_STRATEGY.md`
- `docs/DEFINITION_OF_DONE.md`

## Doc Navigation

For fast onboarding:

1. Vision and boundaries: `docs/PROJECT_VISION.md`, `docs/ARCHITECTURE_DECISIONS.md`
2. Physical structure: `docs/PROJECT_STRUCTURE.md`
3. Execution and operations: `docs/LOCAL_EXECUTION_FLOW.md`, `docs/RUNBOOK.md`
4. Active implementation tracking: `docs/IMPLEMENTATION_ROADMAP.md`, `docs/TECH_DEBT.md`
