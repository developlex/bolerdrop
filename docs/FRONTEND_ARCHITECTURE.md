# FRONTEND_ARCHITECTURE.md

Status: DRAFT
Type: Architecture / Contract
Scope: Storefront frontend system
Freeze: Not applied

## 1. Purpose

This document defines the frontend architecture for the storefront.

Its goals are to:

- describe how the frontend is structured at a system level,
- define clear separation of concerns,
- prevent coupling between UI, domain logic, and platform internals.

This document does not:

- define UI/UX design,
- define concrete components,
- define API queries or schemas,
- prescribe package-manager workflows or local developer tooling commands.

## 2. Architectural Positioning

The storefront frontend is:

- a consumer of backend contracts, not a controller,
- stateless with respect to business logic,
- replaceable without backend changes.

The frontend is a presentation and interaction layer only.

## 3. High-Level Architecture

At a conceptual level, the frontend consists of the following layers:

- Application Shell
- Routing & Navigation
- Presentation Layer
- State Management
- Data Access Layer
- Integration Boundary

Each layer has a single responsibility.

### 3.1 Runtime and Rendering Profile (Current Decision)

For storefront delivery, the current profile is:

- decoupled headless storefront runtime,
- Next.js + TypeScript application shell,
- server-first rendering for indexable customer surfaces,
- GraphQL contract consumption through the documented integration boundary.

SEO-critical surfaces (entry, listing, PDP, and canonical content pages) must be renderable server-side.

### 3.2 Storefront Selection Boundary

Storefront runtime selection is a platform-level profile decision, not a Magento theme toggle.

Rules:

- Magento theme selector is not the control point for decoupled storefront runtime selection,
- decoupled storefront may live in this repository but remains replaceable as an independent deployable unit,
- routing to storefront runtime is controlled by platform/runtime configuration.

## 4. Application Shell

The Application Shell:

- bootstraps the frontend application,
- defines global providers and configuration,
- establishes global error boundaries.

The shell:

- contains no business logic,
- does not encode product or pricing rules.

## 5. Routing & Navigation

Routing is responsible for:

- mapping URLs to logical surfaces,
- enabling deep linking,
- controlling navigation flow.

Routing must:

- be declarative,
- not embed business rules,
- not perform data mutation.

Routing semantics are informed by:

`STORE_FRONTEND_UX.md`

### 5.1 Canonical URL Rules (Technical SEO Boundary)

For indexable catalog surfaces, routing must enforce canonical URL shape.

Rules:

- pagination canonical path uses `/page/<n>` for `n > 1`,
- root catalog canonical path is `/` (not `/page/1`),
- query-based pagination aliases (for example `?page=<n>`) must redirect permanently to canonical path routes,
- canonical metadata tags must match canonical route shape.

Technical SEO verification commands are documented in:

`LOCAL_EXECUTION_FLOW.md`

## 6. Presentation Layer

The presentation layer:

- renders UI based on provided state,
- handles user interactions,
- remains visually and logically isolated.

Rules:

- no direct API calls,
- no business logic,
- no side effects.

Presentation components are pure and reusable.

## 7. State Management

State management is responsible for:

- holding client-side state,
- synchronizing UI with backend data,
- managing transient interaction state.

Boundaries:

- state reflects backend reality; it does not redefine it,
- business rules remain backend-owned,
- derived state must be deterministic.

State does not replace backend validation.

State management adoption policy:

- initial slice: no global client state manager is required by default,
- server state should be handled at the data-access boundary,
- introduce a dedicated client state manager only when cart/session complexity requires it.

## 8. Data Access Layer

The data access layer:

- communicates with backend services,
- implements query and mutation orchestration,
- handles loading and error states.

Rules:

- uses documented contracts only,
- isolates transport details from UI,
- does not leak backend internals upward.

GraphQL usage is defined in:

`GRAPHQL_CONTRACTS.md`

## 9. Integration Boundary

The integration boundary:

- is the only layer allowed to communicate externally,
- abstracts APIs from the rest of the app,
- enforces consistency and error handling.

No other layer may:

- call APIs directly,
- interpret backend responses ad hoc.

## 10. Style Contract Boundary

Magento-coupled storefront views must remain style-agnostic at the component boundary.

Rules:

- components that render contract data (catalog, PDP, cart, account) must consume shared UI style primitives/tokens,
- style tokens and reusable surface/action/text classes are centralized in a dedicated UI style module,
- layout or branding refreshes must be applied in the shared style layer first, not ad hoc per commerce component.

This ensures Magento-coupled components inherit a single style approach without duplicating styling logic.

### 10.1 Enforcement Profile

Frontend standards are enforced in CI and local execution through a dedicated standards gate.

Minimum enforced constraints:

- no explicit `any` in first-party storefront app/lib code,
- no `forwardRef` usage for React 19 profile,
- no `useContext` usage where `use(Context)` is required by the active profile.

Rule selection is aligned to actively maintained (2025+) React/Next composition and performance guidance.

## 11. Error Handling Model

Error handling:

- is centralized,
- produces user-safe messages,
- does not expose internal errors or stack traces.

Operational errors and user errors are distinguished.

## 12. Security Considerations

Frontend security rules:

- no secrets in frontend code,
- no trust in client-side validation,
- all critical checks performed server-side,
- no exposure of internal identifiers beyond contracts.

Security model is defined in:

`SECURITY_MODEL.md`

## 13. Performance Considerations (Conceptual)

The frontend:

- minimizes unnecessary network requests,
- avoids blocking rendering on non-critical data,
- supports incremental data loading.

Performance is a concern, not a constraint at this stage.

## 14. Testing Boundaries

Frontend testing responsibilities include:

- component-level tests,
- state transition tests,
- integration with mocked contracts.

Frontend tests must not:

- depend on production systems,
- bypass documented contracts.

Testing strategy is defined in:

`TESTING_STRATEGY.md`

## 15. Non-Goals

This document does not define:

- visual design system,
- CSS or styling strategy,
- analytics implementation,
- SEO keyword/content strategy specifics,
- accessibility specifics.

These may be documented elsewhere.

## 16. Relationship to Other Documents

This document is authoritative for:

- frontend architectural boundaries

This document depends on:

- `PROJECT_VISION.md`
- `STORE_FRONTEND_UX.md`
- `PRODUCT_MODEL.md`
- `GRAPHQL_CONTRACTS.md`
- `SECURITY_MODEL.md`

In case of conflict:

security and architectural documents take precedence.

## 17. Change Management

Changes to frontend architecture:

- must be documented,
- require an ADR entry if architectural,
- must preserve layer boundaries.

## 18. Document Status

This document is DRAFT

No freeze applied

Frontend architecture is binding once accepted

Implementation must conform

End of document
