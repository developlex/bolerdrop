# CONTROL_PLANE_OVERVIEW.md

Status: DRAFT
Type: Conceptual / Structural
Scope: Control Plane role, responsibilities, and boundaries
Freeze: Not applied

## 1. Purpose

This document provides a high-level overview of the Control Plane.

Its goals are to:

- define what the Control Plane is and is not,
- clarify its responsibilities and limits,
- explain how it interacts with store instances and other systems.

This document does not:

- define API contracts,
- define authentication or authorization models,
- describe UI or user workflows,
- describe implementation details.

## 2. Definition of Control Plane

The Control Plane is a centralized platform component responsible for orchestrating and observing store instances.

It exists to:

- manage store lifecycle,
- coordinate deployments and rollbacks,
- provide operational visibility,
- enforce platform-level contracts.

The Control Plane is not a commerce system and does not participate in business logic execution.

## 3. Control Plane Responsibilities

The Control Plane is responsible for:

- maintaining a registry of store instances,
- tracking store metadata (identifier, environment, isolation mode),
- coordinating provisioning and decommissioning,
- triggering deployments via CI/CD,
- initiating rollback when required,
- collecting and presenting health and status signals,
- acting as the operator's interface to the platform.

## 4. Explicit Non-Responsibilities

The Control Plane must never:

- access store business data (customers, orders, payments),
- access store databases directly,
- access or store store-level secrets,
- perform commerce operations,
- execute arbitrary commands in store runtimes.

These prohibitions are absolute.

## 5. Interaction Model

### 5.1 Control Plane <-> Store Instance

All interactions with a store instance occur exclusively through the Shop Agent.

The Control Plane:

- does not communicate with Magento directly,
- does not bypass the Shop Agent,
- relies on allow-listed operations only.

### 5.2 Control Plane <-> CI/CD

The Control Plane:

- coordinates deployments by invoking CI/CD pipelines,
- does not deploy artifacts itself,
- observes deployment outcomes and status.

CI/CD remains the only execution path for changes.

### 5.3 Control Plane <-> Operators

Operators interact with the platform only via the Control Plane.

Operator actions:

- are constrained by documented authority,
- are observable and auditable,
- do not expose business data.

### 5.4 Control Plane <-> External Systems

External systems (e.g., integrations, monitoring tools):

- interact with the Control Plane via explicit interfaces,
- are untrusted by default,
- must not gain indirect access to store internals.

## 6. Authority Boundaries

Control Plane authority is strictly limited to what is defined in:

`CONTROL_PLANE_AUTHORITY.md`

Any action not explicitly allowed is implicitly forbidden.

The Control Plane must enforce:

- deny-by-default behavior,
- strict separation of duties,
- clear execution boundaries.

## 7. Relationship to Isolation Modes

The Control Plane is isolation-aware but not isolation-breaking.

Responsibilities:

- record which isolation mode applies to each store,
- ensure provisioning follows the selected mode,
- surface isolation mode to operators.

The Control Plane must not:

- bypass isolation constraints,
- dynamically relax isolation for convenience.

Isolation rules are defined in:

`ISOLATION_MODES.md`

## 8. Observability & Reporting

The Control Plane provides operational visibility, including:

- store health status,
- agent availability,
- deployment state,
- last successful operations.

Visibility is operational, not analytical.

## 9. Failure Model

The Control Plane is designed with the assumption that:

- store instances may fail independently,
- the Control Plane itself may fail,
- failures must not cascade across stores.

Failure of the Control Plane:

- must not compromise store data,
- must not grant additional access,
- must be recoverable without store-level intervention.

## 10. Security Posture

The Control Plane operates under a least-privilege security model.

Security guarantees:

- no access to secrets,
- no access to PII,
- no implicit trust relationships.

Security rules are defined in:

`SECURITY_MODEL.md`

## 11. Relationship to Other Documents

This document is authoritative for:

- conceptual understanding of the Control Plane

This document depends on:

- `PROJECT_VISION.md`
- `ARCHITECTURE_DECISIONS.md`
- `CONTROL_PLANE_AUTHORITY.md`
- `SECURITY_MODEL.md`
- `ISOLATION_MODES.md`

In case of conflict, authority and security documents take precedence.

## 12. Change Management

Any change to Control Plane responsibilities or scope:

- must be documented,
- requires an ADR entry,
- must not expand authority implicitly.

## 13. Document Status

This document is DRAFT

No freeze applied

Control Plane boundaries are binding once accepted

Implementation must conform

End of document
