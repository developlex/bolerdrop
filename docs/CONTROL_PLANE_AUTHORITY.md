# CONTROL_PLANE_AUTHORITY.md

Status: DRAFT  
Scope: Control Plane authority, permissions, and prohibitions  
Type: Contractual (non-implementation)  
Freeze: Not applied

## 1. Purpose

This document defines the explicit authority boundaries of the Control Plane.

Its goals are to:

- prevent authority drift into store business domains,
- ensure strict separation between platform operations and store data,
- provide a stable contract for operators, agents, and automation.

This document does not:

- define implementation details,
- define UI/UX,
- define authentication or RBAC mechanics.

## 2. Control Plane Role Definition

The Control Plane is an operational orchestrator, not a commerce system.

Primary responsibilities:

- lifecycle orchestration of store instances,
- visibility into system health and status,
- execution of safe, allow-listed operational actions.

The Control Plane is not a:

- data access layer,
- analytics system,
- store administration interface.

## 3. Authority Model

Authority is defined as what the Control Plane is permitted to do and what it is explicitly forbidden to do.

Authority is enforced through:

- documented allowlists,
- documented prohibitions,
- mandatory use of the Shop Agent boundary.

Any authority not explicitly granted is implicitly denied.

## 4. Allowed Actions (Explicit Allowlist)

The Control Plane may perform the following categories of actions:

### 4.1 Store Registry & Discovery

- register a new store instance
- list existing store instances
- read store metadata (identifier, environment, isolation mode)
- read deployment/version metadata

### 4.2 Lifecycle Operations

- initiate store provisioning
- initiate store start/stop/restart
- initiate store decommissioning

(No direct runtime manipulation is permitted.)

### 4.3 Health & Status Visibility

- read health status of store instances
- read Shop Agent health and availability
- read non-business operational metrics (uptime, version, last deploy)

### 4.4 Safe Operational Actions (via Shop Agent)

Only via Shop Agent and only from an allowlist:

- trigger cache flush
- trigger reindex
- trigger scheduled job execution
- trigger smoke or health checks
- request diagnostic summaries

### 4.5 Deployment Coordination

- trigger deployments through CI/CD
- select or pin approved runtime versions
- initiate rollback to a previous approved version

## 5. Forbidden Actions (Hard Prohibitions)

The Control Plane must never perform or enable the following actions:

### 5.1 Business Data Access

- access store databases
- read or write customer data
- read or write order data
- read or write payment data
- access PII in any form

### 5.2 Credential & Secret Access

- read store secrets
- expose credentials via APIs
- proxy secrets to operators or agents

### 5.3 Direct Runtime Access

- execute arbitrary commands in store runtime
- open shell access to store containers
- bypass the Shop Agent boundary
- interact directly with Magento internals

### 5.4 Implicit Authority Expansion

- introduce undocumented admin/debug endpoints
- add "temporary" access paths
- perform actions not documented in this file

Temporary exceptions are not permitted.

## 6. Shop Agent as Mandatory Boundary

All operational actions must pass through the Shop Agent.

The Control Plane:

- does not communicate with Magento directly,
- does not bypass the agent,
- does not escalate privileges beyond the agent allowlist.

The Shop Agent is the sole execution boundary between Control Plane and store runtime.

## 7. Operator Responsibility Model

Operators interacting with the Control Plane:

- are platform operators, not store administrators,
- are responsible for platform health, not store business outcomes,
- must not access or infer store business data.

Operator intent is limited to platform correctness and availability.

## 8. Audit & Traceability (Contractual)

All Control Plane actions must be:

- attributable to an operator or automation identity,
- logged with timestamp and action intent,
- auditable after execution.

Audit requirements are mandatory, even if implementation is deferred.

## 9. Change Control

Any change to Control Plane authority:

- requires documentation update,
- requires an ADR entry,
- must not retroactively expand authority without explicit approval.

Authority changes are considered high-risk architectural changes.

## 10. Relationship to Other Documents

This document is authoritative for:

- SHOP_AGENT_API.md
- SECURITY_MODEL.md
- RUNBOOK.md

This document depends on:

- PROJECT_VISION.md
- ARCHITECTURE_DECISIONS.md
- ISOLATION_MODES.md

In case of conflict, this document overrides implementation.

## 11. Document Status

This document is DRAFT

No freeze applied

Authority boundaries are explicit and binding

Implementation must conform to this contract

End of document
