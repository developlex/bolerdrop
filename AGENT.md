# AGENT.md

Status: ACTIVE  
Authority: ROOT  
Applies to: All human and automated agents (AI or otherwise)

## 1. Purpose

This document defines mandatory directives for any agent working on this repository.

Its goals are:

- prevent architectural drift,
- preserve isolation boundaries,
- ensure documentation remains authoritative,
- maintain platform-level integrity.

Violation of this document invalidates changes, regardless of correctness.

## 2. Source of Truth Hierarchy

The following authority order is absolute:

1. AGENT.md (this document)
2. /docs/PROJECT_STRUCTURE.md
3. /docs/PROJECT_VISION.md
4. /docs/ARCHITECTURE_DECISIONS.md
5. Other documents under /docs/
6. Source code

If a lower-level artifact conflicts with a higher-level one, the higher-level document wins.

## 3. Structural Invariants (Non-Negotiable)

Agents must not violate the following invariants:

- Control Plane and Store Instances are strictly separated
- Store Instances are isolated from each other
- Control Plane has no access to business data
- CI/CD is the only allowed deployment path
- Documentation lives only in /docs
- Within the repository, runtime configuration templates live only in /instances
- Secrets are never committed

These invariants apply regardless of development phase or urgency.

## 4. Isolation Rules

Isolation is defined in /docs/ISOLATION_MODES.md.

Agents must:

- respect the selected isolation mode per store,
- never introduce cross-store data access,
- never bypass isolation for convenience or cost.

Shared infrastructure does not imply shared data.

## 5. Secrets Handling (Strict)

The following rules are mandatory:

- No secrets in git history
- No secrets in instances/**
- Only `*.env.example` files may be committed for environment templates
- All real secrets must be injected at deploy time

If unsure whether something is a secret - treat it as a secret.

## 6. Control Plane Authority Boundaries

The Control Plane may only perform actions explicitly listed in:

/docs/CONTROL_PLANE_AUTHORITY.md

Agents must not:

- expand control plane privileges,
- introduce direct database access,
- expose customer, order, or payment data,
- add "temporary" admin/debug endpoints.

There are no exceptions.

## 7. Documentation Discipline

Agents must follow these rules:

- Any structural or architectural change must update documentation first or in the same change
- Undocumented behavior is considered non-existent
- New documents must follow existing structure and naming conventions
- If a change cannot be documented clearly, it should not be implemented.

## 8. Definition of Done Enforcement

All implementations must satisfy the criteria in:

/docs/DEFINITION_OF_DONE.md

Partial implementations that do not meet DoD are considered incomplete, even if functional.

## 9. Change Management (ADR)

Architectural or cross-cutting changes must:

- be recorded in /docs/adr/
- include context, decision, and consequences
- not overwrite previous ADRs

Silent architectural changes are forbidden.

## 10. Prohibited Actions

Agents must not:

- introduce hidden coupling between components
- bypass CI/CD for deployment
- add logic directly to infrastructure code
- treat runtime configuration as source code
- optimize by breaking isolation or contracts

"Temporary" shortcuts are treated as permanent violations.

## 11. Enforcement Model

This document is enforced by:

- code review,
- CI checks (where applicable),
- manual rejection of non-conforming changes.

Minimum CI checks should include:

- secret scanning on changed files,
- validation that documentation is updated for architectural or structural changes,
- structural policy checks for prohibited paths/patterns (for example committed real `.env` or private keys).

Compliance is mandatory.

## 12. Acknowledgement

By making changes to this repository, the agent acknowledges and agrees to comply with this document.

End of Directive
