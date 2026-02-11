# PROJECT_STRUCTURE.md

Status: DRAFT
Type: Physical structure definition
Scope: Entire project repository and runtime layout
Decisions: None (descriptive only)

## 1. Document Purpose

This document defines the complete physical structure of the project, including:

- repository layout,
- directory responsibilities,
- separation between source code, infrastructure, runtime state, and documentation.

The goal is that any engineer or agent can understand the project layout without any prior context.

This document does not:

- define architecture choices,
- define UX or product behavior,
- define technology decisions beyond placement.

## 2. Complete Repository Structure

```text
commerce-platform-blueprint/
│
├── AGENT.md
├── README.md
├── Makefile
├── .gitignore
│
├── docs/
│   ├── PROJECT_VISION.md
│   ├── ARCHITECTURE_DECISIONS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DOCUMENTATION_AUDIT.md
│   ├── GIT_WORKFLOW.md
│   │
│   ├── ISOLATION_MODES.md
│   ├── CONTROL_PLANE_AUTHORITY.md
│   ├── SECURITY_MODEL.md
│   ├── SECURITY_THREAT_MODEL.md
│   ├── DATA_LIFECYCLE.md
│   ├── INTEGRATION_MODEL.md
│   ├── SECRETS_MANAGEMENT.md
│   ├── SECRETS_RULES.md
│   │
│   ├── DEFINITION_OF_DONE.md
│   ├── TESTING_STRATEGY.md
│   ├── SMOKE_TESTS.md
│   │
│   ├── CI_CD_OVERVIEW.md
│   ├── DEPLOYMENT_PIPELINE.md
│   ├── ROLLBACK_STRATEGY.md
│   ├── INSTALLATION.md
│   ├── DOCKER_ORCHESTRATION_MODEL.md
│   ├── OBSERVABILITY_MODEL.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── LOCAL_EXECUTION_FLOW.md
│   │
│   ├── RUNBOOK.md
│   │
│   ├── TECH_STACK.md
│   │
│   ├── STORE_FRONTEND_UX.md
│   ├── ADMIN_UX.md
│   ├── PRODUCT_MODEL.md
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── GRAPHQL_CONTRACTS.md
│   ├── CONTROL_PLANE_OVERVIEW.md
│   ├── SHOP_AGENT_API.md
│   ├── MAGENTO_PLUGIN_STRATEGY.md
│   │
│   └── adr/
│       ├── README.md
│       └── 0001-record-architecture-decisions.md
│
├── infra/
│   ├── docker/
│   │   ├── base/
│   │   │   ├── docker-compose.yml
│   │   │   └── env.example
│   │   │
│   │   ├── instance/
│   │   │   ├── docker-compose.override.yml
│   │   │   └── ports.env
│   │   │
│   │   └── control-plane/
│   │       └── docker-compose.yml
│   │
│   └── scripts/
│       ├── new-shop.sh
│       ├── install-magento.sh
│       ├── seed-data.sh
│       ├── reset-instance.sh
│       ├── backup-instance.sh
│       └── health-check.sh
│
├── backend/
│   ├── magento/
│   │   ├── modules/
│   │   │   └── Vendor/
│   │   │       ├── Core/
│   │   │       ├── LeadSource/
│   │   │       ├── Integrations/
│   │   │       │   └── Etsy/
│   │   │       └── Analytics/
│   │   │
│   │   └── patches/
│   │
│   └── shop-agent/
│       ├── src/
│       ├── Dockerfile
│       └── openapi.yaml
│
├── frontend/
│   └── storefront/
│       ├── app/
│       ├── components/
│       ├── graphql/
│       ├── hooks/
│       ├── styles/
│       ├── tests/
│       ├── Dockerfile
│       └── next.config.js
│
├── control-plane/
│   ├── api/
│   │   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── registry/
│   │   └── openapi.yaml
│   │
│   ├── ui/
│   │   ├── app/
│   │   ├── components/
│   │   └── Dockerfile
│   │
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       ├── storefront.yml
│       ├── magento.yml
│       ├── control-plane.yml
│       └── shop-agent.yml
│
└── instances/
    ├── shop-001/
    │   ├── .env.example
    │   └── docker-compose.override.yml
    │
    └── shop-002/
        ├── .env.example
        └── docker-compose.override.yml
```

## 3. Directory Responsibilities (Concise)

### /docs

Authoritative documentation.
No executable code.
Source of truth for structure, contracts, and decisions.

### /infra

Shared infrastructure templates and scripts.
No business logic.
Used for provisioning and orchestration.

### /backend

All backend runtime components except the Control Plane:

- Magento extensions
- integration adapters
- per-instance management agent (Shop Agent)

### /frontend

All user-facing storefront applications.
Decoupled from backend internals.

### /control-plane

Centralized management system:

- store registry
- lifecycle operations
- visibility and orchestration

No access to store business data or secrets.

### /.github/workflows

CI/CD pipelines.
Each workflow corresponds to a deployable system.

### /instances

Runtime representation of deployed stores.
Contains environment-specific configuration only.
Not a source-code location.

Isolation mode selection impacts infra templates and provisioning profiles.

## 4. Structural Rules (Invariant)

- AGENT.md is the root authority document
- Documentation lives only in /docs
- Infrastructure code contains no business logic
- Frontend and backend are physically separated
- Control Plane never lives inside store runtime
- Runtime instances are not treated as source code
- instances/** contains runtime config only; secrets are never committed; only templates are committed

## 5. Authority & Conflict Resolution

In case of conflict, the following precedence applies:

1. AGENT.md
2. Security, authority, and isolation documents
3. Structural documentation (`PROJECT_STRUCTURE.md`)
4. Other documentation
5. Source code

Lower-precedence artifacts must conform to higher-precedence ones.

## 6. Document Status

This document is DRAFT.
No freeze applied.

Structure may evolve, but all changes must be reflected in this document.

End of document
