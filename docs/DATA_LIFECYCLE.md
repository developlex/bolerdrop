# DATA_LIFECYCLE.md

Status: DRAFT
Type: Data Governance / Lifecycle Contract
Scope: Store data ownership, retention, deletion, and compliance
Freeze: Not applied

## 1. Purpose

This document defines the data lifecycle model for the platform.

Its goals are to:

- clearly define data ownership boundaries,
- describe how data is created, retained, and deleted,
- prevent accidental data leakage or indefinite retention,
- align with regulatory requirements (GDPR / CCPA at a high level).

This document does not:

- define database schemas,
- prescribe backup tooling,
- define data analytics pipelines,
- define legal interpretations of regulations.

## 2. Data Ownership Model

### 2.1 Store-Level Ownership

All business data belongs to the store instance, not the platform.

Examples:

- products
- customers
- orders
- pricing
- inventory

The platform:

- operates the infrastructure,
- enforces isolation,
- does not claim ownership of store data.

### 2.2 Platform-Level Data

The platform may own operational metadata, such as:

- store identifiers,
- deployment state,
- health signals,
- audit records.

Platform data must never include:

- customer PII,
- order contents,
- payment information.

## 3. Data Classification

Data is classified into the following categories:

- Business Data (store-owned)
- Operational Metadata (platform-owned)
- Secrets (externally managed)
- Logs & Audit Trails (controlled exposure)

Each category has different lifecycle rules.

## 4. Business Data Lifecycle

### 4.1 Creation

Business data is created:

- through storefront interactions,
- through admin actions,
- through documented integrations.

Creation is always scoped to a single store instance.

### 4.2 Active Retention

Business data is retained:

- for active store operation,
- as long as the store is active.

Retention duration is:

- store-defined,
- subject to regulatory requirements.

The platform does not enforce business retention policy by default.

### 4.3 Modification

Business data may be modified:

- by store admins,
- by documented backend workflows.

The platform does not mutate business data directly.

### 4.4 Deletion

Business data deletion may occur due to:

- explicit admin action,
- regulatory requests (e.g., data subject requests),
- store decommissioning.

Deletion must:

- be explicit,
- be auditable,
- respect isolation boundaries.

## 5. Store Decommissioning Lifecycle

When a store is decommissioned:

- Store is marked inactive
- Store runtime is stopped
- Business data enters retention or deletion phase
- Infrastructure resources are released

The platform must not:

- silently delete store data,
- retain store data indefinitely without intent.

## 6. Backups (Conceptual)

Backups are treated as copies of store-owned data.

Rules:

- backups are scoped per store,
- backups must respect isolation,
- backup retention policies must be documented,
- backups must be deletable.

Backups must not:

- create cross-store data coupling,
- be accessible to the Control Plane.

## 7. Data Access Boundaries

### 7.1 Control Plane

The Control Plane must never:

- access store business data,
- query store databases,
- inspect customer or order information.

### 7.2 Shop Agent

The Shop Agent:

- operates at store scope,
- must not expose business data via its API,
- may perform operational actions affecting data indirectly (e.g., reindex).

### 7.3 Store Admin

Store admins may:

- access and manage their own store data,
- initiate deletion or export flows (conceptual).

Admins must not:

- access other stores' data,
- access platform operational metadata beyond what is exposed.

## 8. Regulatory Alignment (High-Level)

### 8.1 GDPR

The platform design supports GDPR principles by:

- strict data isolation,
- explicit ownership boundaries,
- ability to delete or anonymize data,
- no hidden data replication.

### 8.2 CCPA

The platform design supports CCPA principles by:

- limiting data collection to store needs,
- preventing unauthorized data sharing,
- supporting data deletion on request.

Legal enforcement is store responsibility; the platform provides structural support.

## 9. Logs, Metrics, and Audit Data

Operational data such as logs and metrics:

- must avoid storing PII,
- must be scoped by store where applicable,
- must have bounded retention.

Audit logs:

- record actions, not data contents,
- are platform-owned,
- must be protected from tampering.

## 10. Data Export & Portability (Conceptual)

Store admins may require:

- data export for compliance,
- migration to another platform.

The platform:

- must not block data portability,
- must not retain exported data unnecessarily.

Export mechanisms are implementation-specific.

## 11. Data Breach Containment

In case of suspected data breach:

- scope of affected store(s) must be identifiable,
- cross-store exposure must be ruled out,
- data access logs must support investigation.

Incident handling is governed by:

- `RUNBOOK.md`
- `SECURITY_THREAT_MODEL.md`

## 12. Non-Goals

This document does not define:

- exact retention periods,
- encryption algorithms,
- legal workflows,
- data warehouse or analytics strategy.

## 13. Relationship to Other Documents

This document is authoritative for:

- data ownership and lifecycle concepts

This document depends on:

- `SECURITY_MODEL.md`
- `SECURITY_THREAT_MODEL.md`
- `ISOLATION_MODES.md`
- `CONTROL_PLANE_AUTHORITY.md`

In case of conflict:

security and authority documents take precedence.

## 14. Change Management

Changes to data lifecycle rules:

- must be documented,
- require an ADR entry,
- must not weaken isolation or deletion guarantees.

## 15. Document Status

This document is DRAFT

No freeze applied

Data lifecycle rules are binding once accepted

Implementation must conform

End of document
