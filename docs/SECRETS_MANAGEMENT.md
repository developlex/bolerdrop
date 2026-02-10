# SECRETS_MANAGEMENT.md

Status: DRAFT  
Scope: Secrets handling, storage, and exposure rules  
Type: Contractual (non-implementation)  
Freeze: Not applied

## 1. Purpose

This document defines mandatory rules for handling secrets across the platform.

Its goals are to:

- prevent accidental or intentional secret leakage,
- establish clear ownership and responsibility,
- enforce separation between source code and sensitive data.

This document does not:

- prescribe a specific secret manager,
- define encryption mechanisms,
- define runtime injection tooling.

## 2. Definition of a Secret

A secret is any value that could enable unauthorized access, impersonation, or data exposure, including but not limited to:

- credentials (passwords, tokens, keys),
- API keys and OAuth secrets,
- database connection strings,
- private certificates or signing keys,
- payment provider credentials,
- third-party integration credentials.

If uncertainty exists, the value must be treated as a secret.

## 3. Core Principles

The following principles are non-negotiable:

- Secrets are never committed to version control
- Secrets are never logged in plaintext
- Secrets are never exposed via APIs
- Secrets are never shared between stores
- Secrets are injected, not stored

Violation of any principle invalidates the change.

## 4. Source Code Rules

### 4.1 Prohibited Content

The repository must not contain:

- real secrets in any file,
- credentials in comments,
- base64-encoded secrets,
- example secrets that "look fake but work".

There are no exceptions.

### 4.2 Allowed Content

The repository may contain:

- `.env.example` files with placeholder values only,
- documentation listing secret names, not values,
- configuration templates referencing environment variables.

Placeholders must be clearly non-functional.

## 5. Runtime Configuration Boundaries

### 5.1 `/instances` Directory Rules

The `/instances` directory represents runtime state, not source code.

Rules:

- `.env` files inside `instances/**` must never be committed
- only `.env.example` files may exist in the repository
- instance-specific secrets are injected at runtime

Any committed secret under `instances/**` is a critical violation.

### 5.2 `.gitignore` Requirements

The following patterns must be ignored:

- `instances/**/.env`
- `instances/**/.env.*`
- `instances/**/secrets*`
- `*.pem`
- `*.key`
- `*.crt`
- `*.p12`

Ignoring secrets is mandatory, not optional.

## 6. Injection Model (Abstract)

Secrets must be provided to the runtime via external injection mechanisms, such as:

- CI/CD environment variables,
- runtime configuration providers,
- secure secret stores.

The exact mechanism is intentionally unspecified in this document.

Secrets must not be:

- hardcoded,
- copied between environments,
- manually edited on running systems.

## 7. Control Plane Restrictions

The Control Plane:

- must not store store-level secrets,
- must not read store-level secrets,
- must not proxy secrets to operators or agents.

If the Control Plane can read a secret, the design is invalid.

## 8. Store-Level Isolation

Secrets are scoped per store instance.

Rules:

- no secret sharing between stores,
- no fallback to shared credentials,
- no cross-store secret references.

Isolation mode does not change secret boundaries.

## 9. Logging & Observability

Secrets must never appear in:

- logs,
- error messages,
- metrics,
- traces,
- audit records.

Logs containing secrets are considered compromised.

## 10. Auditing & Detection (Contractual)

The platform must support:

- detection of committed secrets,
- identification of secret exposure incidents,
- traceability of secret usage scope.

Implementation may be deferred, but the requirement is binding.

## 11. Incident Handling (Conceptual)

In case of suspected secret exposure:

- the secret is considered compromised,
- rotation is mandatory,
- reuse is prohibited.

Root cause analysis is required before re-enabling access.

## 12. Relationship to Other Documents

This document is authoritative for:

- `CONTROL_PLANE_AUTHORITY.md`
- `RUNBOOK.md`
- `CI_CD_OVERVIEW.md`

This document depends on:

- `PROJECT_STRUCTURE.md`
- `ISOLATION_MODES.md`

In case of conflict, this document overrides implementation.

## 13. Change Management

Changes to secrets handling rules:

- require documentation update,
- require an ADR entry,
- must not weaken existing guarantees.

## 14. Document Status

This document is DRAFT

No freeze applied

Rules are strict and binding

Implementation must conform

End of document
