# TECH_DEBT.md

Status: DRAFT  
Type: Engineering backlog / Technical debt register  
Scope: Deferred implementation risks and improvements  
Freeze: Not applied

## 1. Purpose

This file tracks known technical debt that is intentionally deferred.

It is used to:

- record non-blocking gaps,
- prioritize risk reduction work,
- prevent debt from being forgotten.

## 2. Rules

- Debt entries must be concrete and actionable.
- Each entry must include impact and target phase.
- Closing an entry requires a linked implementation change.

## 3. Debt Backlog

| ID | Item | Impact | Target | Notes |
|---|---|---|---|---|
| TD-001 | Enforce strict per-instance `.env` completeness validation before launch. | Medium | Near-term | Fail fast if required keys are missing/empty. |
| TD-002 | Add bootstrap warning banner for auto-generated local credentials/secrets. | Medium | Near-term | Message must clearly state local-only and rotation requirement. |
| TD-003 | Add `--strict-secrets` bootstrap mode requiring user-provided credential fields. | High | Near-term | Useful for shared/staging-like environments. |
| TD-004 | Add uniqueness guardrails for `STORE_ID`, host ports, and base URLs across instances. | High | Near-term | Prevent cross-instance collisions and accidental overlap. |
| TD-005 | Add automated dual-store smoke check in CI for isolation confidence. | High | Near-term | Verifies two instances can run concurrently without interference. |
| TD-006 | Define Magento compatibility matrix (Magento/PHP/Search/DB) as enforceable checks. | Medium | Mid-term | Reduce upgrade/setup breakage. |
| TD-007 | Improve bootstrap observability summary output (instance URLs + health hints). | Low | Mid-term | Faster local triage and onboarding. |
| TD-008 | Implement storefront product reviews parity with Magento customer flows. | Medium | Near-term | Support review list display, review submission, and product-page review signals. |
| TD-009 | Implement storefront product comparison parity with Magento compare flows. | Medium | Near-term | Support add/remove compare actions and compare results page in storefront UX. |

## 4. Relationship to Other Documents

This file is informed by:

- `docs/INSTALLATION.md`
- `docs/LOCAL_EXECUTION_FLOW.md`
- `docs/DOCKER_ORCHESTRATION_MODEL.md`
- `docs/SECRETS_MANAGEMENT.md`

In case of conflict, contractual architecture/security documents take precedence.

## 5. Document Status

This document is DRAFT.
No freeze applied.

End of document
