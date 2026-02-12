# GRAPHQL_CONTRACTS.md

Status: DRAFT
Type: Contract (API boundary, non-implementation)
Scope: Storefront <-> Commerce GraphQL interaction model
Freeze: Not applied

## 1. Purpose

This document defines the GraphQL contract boundary between the storefront frontend and the commerce backend.

Its goals are to:

- establish GraphQL as the canonical storefront data interface,
- define the categories of operations the storefront may perform,
- enforce security, isolation, and stability constraints for GraphQL usage.

This document does not:

- define an exact schema,
- enumerate vendor-specific types,
- prescribe resolver implementations,
- define caching or performance tactics.

## 2. Contract Positioning

GraphQL is the primary data interface for the storefront.

Rules:

- storefront uses GraphQL for commerce data access,
- storefront does not call backend internals directly,
- GraphQL is treated as a contract, not a convenience layer.

GraphQL is not a replacement for:

- Shop Agent API (operations boundary),
- Control Plane interfaces (platform operations).

## 3. GraphQL Contract Ownership

Ownership is defined as follows:

- Backend owns schema correctness and enforcement of business rules.
- Frontend owns consumption patterns and query discipline.
- Control Plane does not use commerce GraphQL for operations.

Any cross-cutting changes require an ADR.

## 4. Data Classification & Exposure Rules

GraphQL responses may include:

- public catalog information,
- product availability signals,
- pricing as a presentation-ready value (conceptual),
- cart state necessary for checkout.

GraphQL must not expose:

- platform secrets,
- internal infrastructure metadata,
- cross-store identifiers enabling data traversal,
- PII beyond what is required for the active session's checkout context.

Security rules are governed by:

- `SECURITY_MODEL.md`
- `SECRETS_MANAGEMENT.md`

## 5. Store Isolation Guarantees

GraphQL must respect store isolation:

- queries must be scoped to exactly one store context,
- cross-store access is forbidden,
- no "global admin" query patterns.

Isolation rules are governed by:

`ISOLATION_MODES.md`

## 6. Operation Categories (Contractual)

The storefront GraphQL interaction is limited to these categories:

- Catalog Discovery
- Product Detail & Variant Selection
- Cart Management
- Checkout Initiation & Completion
- Customer Session (Optional / Future)

No other categories are allowed without documentation + ADR.

## 7. Required Contract Surfaces (Conceptual)

This section defines the conceptual contract surfaces the schema must support.

### 7.1 Catalog Discovery Contracts

The schema must support:

- retrieving product listings for discovery surfaces,
- retrieving categories/collections or equivalent grouping,
- filtering by variant attributes (conceptual),
- sorting (conceptual).

Outputs must be safe for public viewing.

### 7.2 Product Detail Contracts

The schema must support:

- retrieving a single product by identifier,
- retrieving its variant options/attributes,
- retrieving price and availability signals per variant,
- retrieving product media/content references.

Product concepts are governed by:

`PRODUCT_MODEL.md`

### 7.3 Cart Contracts

The schema must support:

- creating a cart context,
- adding a variant to cart,
- removing items,
- updating quantities,
- retrieving cart state.

Cart semantics:

- represent purchase intent only,
- do not constitute an order.

### 7.4 Checkout Contracts

The schema must support:

- capturing required customer inputs (conceptual),
- capturing shipping address inputs for physical carts,
- capturing or selecting shipping method for physical carts,
- validating checkout readiness (conceptual),
- submitting checkout to create an order outcome (conceptual),
- returning confirmation surface data.

This document does not define payment mechanics.

### 7.5 Customer Session Contracts (Optional / Future)

If supported, the schema may include:

- login/logout operations,
- customer account registration operations,
- retrieving customer profile basics,
- retrieving order history.

This remains optional for core checkout operation, but customer-session flows may be enabled per storefront profile.

## 8. Mutation Safety Rules

GraphQL mutations must be:

- scoped to the active store context,
- scoped to the active customer/cart session,
- validated server-side,
- idempotent where feasible.

For checkout mutations:

- shipping address mutation must be executed before shipping method resolution,
- shipping method must be validated against methods available for the active cart scope.

Mutations must not:

- perform administrative actions,
- trigger platform operations,
- expose secrets,
- allow arbitrary data writes.

Admin actions are not performed via storefront GraphQL contracts.

## 9. Error Handling Contract

GraphQL error responses must:

- be structured and deterministic,
- not leak stack traces,
- not leak sensitive identifiers,
- provide stable error codes suitable for UI mapping.

Frontend must not interpret unknown errors as success.

## 10. Versioning & Evolution Rules

GraphQL schema evolution must follow:

- additive changes preferred,
- breaking changes require ADR and explicit migration path,
- deprecated fields must have a deprecation window,
- clients must not depend on undocumented behavior.

Schema drift without documentation is forbidden.

## 11. Observability & Audit Constraints (Conceptual)

GraphQL operations must support:

- request correlation identifiers,
- basic operational logging without PII leakage,
- rate-limiting or abuse controls (conceptual requirement).

Logging must comply with:

`SECURITY_MODEL.md`

## 12. Relationship to Other Interfaces

Storefront <-> Backend: GraphQL (this document)
Control Plane <-> Store: Shop Agent API (`SHOP_AGENT_API.md`)
Platform Operations: Control Plane contracts (`CONTROL_PLANE_AUTHORITY.md`)

These boundaries must not be mixed.

## 13. Relationship to Other Documents

This document is authoritative for:

- storefront <-> backend GraphQL boundary rules

This document depends on:

- `STORE_FRONTEND_UX.md`
- `PRODUCT_MODEL.md`
- `FRONTEND_ARCHITECTURE.md`
- `SECURITY_MODEL.md`
- `ISOLATION_MODES.md`

In case of conflict:

security and authority documents take precedence.

## 14. Change Management

Any change to GraphQL contract categories or exposure rules:

- must be documented,
- requires an ADR entry,
- must preserve store isolation and security constraints.

## 15. Document Status

This document is DRAFT

No freeze applied

Contract rules become binding once accepted

Implementation must conform

End of document
