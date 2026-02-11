# TECH_STACK.md

Status: DRAFT
Scope: Technology stack inventory and responsibility mapping
Type: Descriptive / Contractual
Freeze: Not applied

## 1. Purpose

This document defines the technology stack used by the platform.

Its goals are to:

- provide a shared vocabulary for technologies in use,
- clarify responsibility boundaries between components,
- prevent undocumented or ad-hoc technology introduction.

This document does not:

- justify technology choices,
- specify versions or configurations,
- describe implementation details.

## 2. Stack Classification

Technologies are grouped by responsibility domain, not by vendor or language.

Domains:

- Documentation
- Infrastructure & Runtime
- Backend (Commerce)
- Frontend (Storefront)
- Control Plane
- CI/CD & Automation
- Testing & Verification
- Observability (conceptual)

## 3. Documentation

Used for all authoritative project artifacts.

- Markdown
- Git-based version control

Documentation is the source of truth and precedes code.

## 4. Infrastructure & Runtime

Used to provision, run, and isolate systems.

- Containerization (Docker-compatible runtime)
- Container orchestration (compose-style for local/runtime)
- Linux-based runtime environments

Infrastructure code is declarative and contains no business logic.

## 5. Backend (Commerce Runtime)

Used to implement store business logic.

- Adobe Commerce (Magento)
- PHP runtime (PHP-FPM model)
- Web tier: Apache 2.4.x or Nginx (deployment-profile specific)
- Composer-based dependency management
- Relational database (MySQL 8.0 / MariaDB compatible profile)
- Cache layer (Redis/Valkey compatible profile)
- Search/indexing layer (OpenSearch-compatible profile)

Backend extensions are implemented as modular components.

## 6. Shop Agent

Used as the execution and management boundary per store instance.

- HTTP-based API
- OpenAPI-described interface
- Containerized runtime

The Shop Agent exposes only allow-listed operational actions.

## 7. Frontend (Storefront)

Used to implement the customer-facing UI.

- React
- TypeScript
- Headless architecture
- GraphQL-based data access

Frontend is decoupled from backend internals.

## 8. Control Plane

Used for centralized orchestration and visibility.

- API service (language/runtime unspecified)
- Web-based UI
- Registry and orchestration logic

Control Plane does not contain commerce logic or business data.

## 9. APIs & Contracts

Used for inter-component communication.

- GraphQL (storefront <-> commerce)
- REST/HTTP APIs (management and integrations)
- OpenAPI for management contracts

All APIs are explicitly documented.

## 10. CI/CD & Automation

Used to build, verify, and deploy systems.

- CI/CD pipelines (provider unspecified)
- Immutable artifact creation
- Automated verification and deployment

CI/CD is the only allowed deployment path.

## 11. Testing & Verification

Used to validate correctness and operability.

- Static validation
- Unit testing
- Integration testing
- Smoke testing
- Operational verification

Testing layers are defined in:

- `TESTING_STRATEGY.md`
- `SMOKE_TESTS.md`

## 12. Secrets & Configuration

Used to manage sensitive data and runtime configuration.

- Environment variable-based injection
- External secret storage (mechanism unspecified)

Secrets handling rules are defined in:

`SECRETS_MANAGEMENT.md`

## 13. Observability (Conceptual)

Used to understand system state.

- Health checks
- Logs
- Metrics
- Audit trails

Observability requirements are defined across:

- `RUNBOOK.md`
- `DEFINITION_OF_DONE.md`
- `SECURITY_MODEL.md`

## 14. Technology Introduction Rules

New technologies:

- must be documented here,
- must not violate existing contracts,
- require an ADR if architectural in nature.

Undocumented technologies are not permitted.

## 15. Relationship to Other Documents

This document is authoritative for:

- technology inventory

This document depends on:

- `PROJECT_STRUCTURE.md`
- `ARCHITECTURE_DECISIONS.md`

In case of conflict, architectural and security documents take precedence.

## 16. Document Status

This document is DRAFT

No freeze applied

Stack definitions are descriptive, not prescriptive

Implementation must align

End of document
