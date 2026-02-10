# ADR README

Status: DRAFT
Scope: Architecture Decision Records (ADR) process
Type: Governance / Contractual
Freeze: Not applied

## 1. Purpose

This document defines the Architecture Decision Record (ADR) process for the project.

Its goals are to:

- capture architectural decisions explicitly,
- provide traceability over time,
- prevent undocumented or implicit changes to architecture.

ADR is the only accepted mechanism for recording architectural decisions and changes.

## 2. What Requires an ADR

An ADR is required for any decision that:

- changes architecture boundaries,
- affects Control Plane authority,
- affects isolation modes or economics,
- affects security or secrets handling,
- changes CI/CD guarantees or deployment model,
- introduces or removes a major component,
- alters documented contracts or invariants.

If a change impacts more than one document in `/docs`, it requires an ADR.

## 3. What Does NOT Require an ADR

An ADR is not required for:

- documentation wording or clarity improvements,
- purely additive clarifications,
- typo fixes,
- changes explicitly marked as non-architectural.

When in doubt, write an ADR.

## 4. ADR Directory Structure

All ADRs live under:

`docs/adr/`

Naming convention:

`NNNN-short-decision-title.md`

Where:

- `NNNN` is a zero-padded incremental number (e.g. `0001`)
- titles are lowercase, hyphen-separated, descriptive
- ADR numbers are never reused.

## 5. ADR Lifecycle

Each ADR follows this lifecycle:

- Proposed
- Accepted
- Superseded (optional)
- Deprecated (optional)

Status must be clearly indicated at the top of the ADR.

## 6. ADR Template (Mandatory)

All ADRs must follow this structure:

```md
# ADR NNNN: <Decision Title>

Status: Proposed | Accepted | Superseded | Deprecated
Date: YYYY-MM-DD

## Context
What problem is being solved.
What constraints exist.
Why a decision is required.

## Decision
The decision that was made.
What is chosen.
What is explicitly not chosen.

## Alternatives Considered
Other options that were evaluated.
Why they were not selected.

## Consequences
Positive outcomes.
Trade-offs.
Risks and limitations.

## References
Links to related documents or ADRs.
```

Deviation from this template is not allowed.

## 7. Relationship Between ADRs and Documentation

ADRs do not replace documentation.

ADRs explain why documentation exists in its current form.

Documentation reflects the current state.

ADRs record the history of decisions.

If documentation and ADRs conflict:

- documentation defines current behavior,
- ADRs explain historical context.

## 8. Change Enforcement

Any architectural change must:

- include an ADR,
- update affected documentation,
- preserve existing invariants unless explicitly superseded.

Undocumented architectural changes are invalid.

## 9. Superseding Decisions

When a decision changes:

- a new ADR is created,
- the old ADR is marked as Superseded,
- references between ADRs must be explicit.

History is preserved; nothing is deleted.

## 10. Authority

ADR process is governed by:

- `AGENT.md`
- `PROJECT_VISION.md`
- `ARCHITECTURE_DECISIONS.md`

Violation of the ADR process invalidates the change.

## 11. Document Status

This document is DRAFT

No freeze applied

ADR process is mandatory once accepted

All future architectural changes must comply

End of document
