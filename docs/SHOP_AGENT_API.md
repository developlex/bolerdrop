# SHOP_AGENT_API.md

Status: DRAFT
Type: Contract (API surface, non-implementation)
Scope: Shop Agent management interface per store instance
Freeze: Not applied

## 1. Purpose

This document defines the Shop Agent API contract.

Its goals are to:

- specify the management interface exposed by each store instance,
- enforce the Shop Agent as the mandatory execution boundary,
- constrain operations to an explicit allowlist.

This document does not:

- prescribe HTTP framework or runtime,
- define authentication mechanisms,
- define deployment topology,
- provide implementation code.

## 2. Role of the Shop Agent

The Shop Agent is a per-store management service that:

- exposes a minimal management API,
- executes only allow-listed operations,
- prevents direct Control Plane access to Magento internals.

Control Plane must never bypass the agent.

Authority limits are defined in:

`CONTROL_PLANE_AUTHORITY.md`

## 3. API Principles (Hard Rules)

- Deny by default: any undefined operation is forbidden
- Non-destructive by default: no actions that mutate business data
- No secrets exposure: secrets must never be returned
- No business data access: no customer/order/payment data
- No arbitrary execution: no shell/SQL command execution
- Idempotent where possible: repeated calls should not break state
- Auditable: every action must be attributable and logged

## 4. Identity & Scoping

Each Shop Agent instance is scoped to exactly one store instance:

- `store_id` is the identity boundary
- the agent must not operate on other stores
- cross-store operations are forbidden

## 5. API Categories

The Shop Agent API is divided into three categories:

- Read-only status endpoints
- Safe operational actions (allowlisted)
- Verification endpoints (smoke/health triggers)

No other categories are permitted without an ADR.

## 6. Endpoint Contract (Conceptual)

This section defines conceptual endpoints and required behavior.
Names are indicative; the contract is in semantics and constraints.

### 6.1 Health & Status

`GET /health`

Purpose: liveness/readiness indicator
Returns: agent health state only
Must not return: secrets, internal topology

`GET /status`

Purpose: operational status summary
Returns (allowed fields only):

- agent version
- store instance identifier
- current deployment version (if available)
- last successful operation timestamp
- high-level component states (e.g., "backend reachable: yes/no")

Must not return:

- customer/order/payment data
- detailed infrastructure metadata that expands attack surface

### 6.2 Operational Actions (Allowlist)

All actions must:

- be explicitly enumerated here,
- be non-destructive to business data,
- return structured results (success/failure + reason),
- produce audit logs.

`POST /ops/cache/flush`

Purpose: flush cache(s)
Constraints: must not delete business data

`POST /ops/index/reindex`

Purpose: trigger search/index rebuild
Constraints: must not require DB access from Control Plane

`POST /ops/cron/run`

Purpose: trigger scheduled job runner
Constraints: bounded execution; no "run arbitrary job"

`POST /ops/diagnostics`

Purpose: collect minimal diagnostics summary
Allowed output:

- component health states
- timestamps
- error codes (non-sensitive)

Forbidden output:

- logs containing secrets
- database dumps
- request payload mirrors containing PII

### 6.3 Verification Actions

`POST /verify/smoke`

Purpose: run store-local smoke verification
Behavior:

- executes defined smoke suite
- returns pass/fail + summary
- must be safe and non-destructive

Smoke definitions are governed by:

`SMOKE_TESTS.md`

## 7. Request/Response Requirements

### 7.1 Response Shape (Minimum)

All responses must include:

- request_id (unique)
- timestamp
- status (success | failure)
- message (human-readable, non-sensitive)

For failures:

- error_code (stable identifier)
- retryable (boolean)

### 7.2 Error Handling

- errors must not leak secrets
- errors must not include stack traces in production-facing contexts
- failures must be deterministic and explainable

## 8. Security & Authorization (Contractual)

This document does not define the auth mechanism, but requires:

- all non-health endpoints must be protected
- authorization must be enforced per store instance
- least privilege must apply
- request provenance must be auditable

Security model is defined in:

`SECURITY_MODEL.md`

Secrets rules are defined in:

`SECRETS_MANAGEMENT.md`

## 9. Observability & Audit (Mandatory)

All Shop Agent calls must produce auditable records including:

- caller identity (operator/automation)
- action name
- store instance scope
- timestamp
- outcome (success/failure)

Audit logs must never include secrets or PII.

## 10. Prohibited Capabilities (Explicit)

The Shop Agent must never expose:

- arbitrary command execution
- SQL execution
- filesystem browsing / download
- direct Magento admin actions
- customer/order/payment reads
- secret reads
- debugging endpoints that bypass auth

Any of the above requires immediate rejection.

## 11. Change Management

Any change to Shop Agent API surface:

- must update this document,
- requires an ADR entry,
- must remain consistent with Control Plane authority boundaries.

## 12. Relationship to Other Documents

This document is authoritative for:

- the allowed operational API surface per store instance

This document depends on:

- `CONTROL_PLANE_AUTHORITY.md`
- `SECURITY_MODEL.md`
- `SMOKE_TESTS.md`
- `SECRETS_MANAGEMENT.md`

In case of conflict:

authority and security documents take precedence.

## 13. Document Status

This document is DRAFT

No freeze applied

Once accepted, the API surface becomes binding

Implementation must conform

End of document
