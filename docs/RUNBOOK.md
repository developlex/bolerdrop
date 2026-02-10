# RUNBOOK.md

Status: DRAFT
Scope: Operational procedures and incident handling
Type: Operational Contract
Freeze: Not applied

## 1. Purpose

This document defines the operational runbook for the platform.

Its goals are to:

- provide deterministic operator actions,
- reduce ambiguity during incidents,
- ensure consistent handling of operational events.

This document does not:

- document implementation details,
- provide troubleshooting theory,
- replace monitoring or alerting systems.

The runbook defines what to do, not how it is implemented.

## 2. Intended Audience

This runbook is intended for:

- platform operators,
- on-call engineers,
- automation acting on behalf of operators.

It is not intended for:

- store administrators,
- developers implementing features,
- external integrations.

## 3. Operational Principles

All operational actions must adhere to:

- Control Plane authority boundaries
- CI/CD-only deployment rules
- Isolation guarantees
- Secrets handling rules

If an action violates a contract, it must not be performed.

## 4. Normal Operations

### 4.1 Checking Platform Health

Operators may:

- check overall platform health,
- check Control Plane health,
- check store instance health via reported status.

Operators must not:

- inspect store internals,
- access business data.

### 4.2 Checking Store Instance Status

For a given store instance, operators may verify:

- instance availability,
- agent responsiveness,
- last deployment version,
- last successful operation timestamp.

## 5. Incident Categories

Incidents are categorized as:

Platform-level incidents  
(Control Plane, CI/CD, shared infrastructure)

Store-level incidents  
(single store unhealthy or degraded)

Deployment-related incidents  
(failed or partial deployments)

Each category has different response boundaries.

## 6. Store-Level Incident Handling

When a store instance is unhealthy:

- Verify reported health status
- Verify agent availability
- Confirm last deployment status
- Identify whether incident is isolated to a single store

Operators must not:

- access the store database,
- inspect customer or order data,
- apply manual runtime fixes.

## 7. Platform-Level Incident Handling

When platform components are unhealthy:

- Verify Control Plane availability
- Verify CI/CD system availability
- Identify scope of impact (single vs multiple stores)

Priority:

- restore platform control and visibility,
- avoid cascading failures.

## 8. Deployment Failure Handling

On deployment failure:

- Stop the deployment immediately
- Verify which components are affected
- Do not apply manual fixes
- Initiate rollback if criteria are met

Partial deployments are considered failures.

## 9. Rollback Procedure (Conceptual)

Rollback may be initiated when:

- deployment fails verification,
- system health degrades post-deploy,
- Definition of Done is violated.

Rollback requirements:

- rollback target is explicit,
- rollback is performed via CI/CD,
- post-rollback smoke checks pass.

## 10. Smoke Test Failures

If smoke tests fail:

- deployment is considered unsuccessful,
- system is not considered "done",
- rollback or remediation is required.

Smoke tests are authoritative.

## 11. Secrets-Related Incidents

If a secret exposure is suspected:

- Treat the secret as compromised
- Initiate secret rotation
- Prevent further access using the compromised secret
- Document the incident

Secrets must never be inspected or reused.

## 12. Security Incidents

For suspected security incidents:

- prioritize isolation and containment,
- do not attempt ad-hoc fixes,
- follow documented security escalation paths.

Security rules are defined in:

`SECURITY_MODEL.md`

## 13. Documentation & Incident Recording

For all significant incidents:

- record incident summary,
- record affected components,
- record resolution actions,
- update documentation if gaps are discovered.

Undocumented incident responses are considered incomplete.

## 14. Prohibited Operator Actions

Operators must not:

- bypass CI/CD,
- execute arbitrary commands,
- access store data,
- modify runtime state manually,
- introduce undocumented behavior.

Violations invalidate operational compliance.

## 15. Relationship to Other Documents

This document is authoritative for:

- day-to-day operations
- incident handling procedures

This document depends on:

- `CONTROL_PLANE_AUTHORITY.md`
- `CI_CD_OVERVIEW.md`
- `DEFINITION_OF_DONE.md`
- `SECURITY_MODEL.md`

In case of conflict, security and authority documents override.

## 16. Document Status

This document is DRAFT

No freeze applied

Operational rules are binding once accepted

Implementation must conform

End of document
