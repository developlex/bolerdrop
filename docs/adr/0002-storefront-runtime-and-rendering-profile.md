# ADR 0002: Storefront Runtime And Rendering Profile

Status: Proposed
Date: 2026-02-11

## Context

The platform requires a decoupled storefront that can evolve independently from Magento backend internals.

A decision is needed for:

- runtime boundary of the storefront,
- rendering model for SEO-critical surfaces,
- migration risk between simple SPA and server-rendered approaches.

The platform also requires clear separation between Magento-native theme mechanisms and decoupled storefront runtime selection.

## Decision

The storefront runtime profile is defined as:

- decoupled headless storefront runtime,
- Next.js + React + TypeScript baseline,
- server-first rendering profile for SEO-critical surfaces,
- GraphQL contract boundary for storefront-to-commerce data access.

Storefront runtime selection is a platform-level profile decision, not a Magento theme-selector decision.

Initial state-management policy:

- do not require a global client state manager in the first slice,
- introduce one only when cart/session complexity justifies it.

## Alternatives Considered

### Alternative A: React SPA (non-Next) first, migrate later

Pros:

- lower initial setup complexity,
- fast local scaffolding.

Cons:

- significant migration cost for SEO/server-rendering later,
- larger refactor surface (routing, rendering, metadata, deployment model).

### Alternative B: Magento native theme-first approach

Pros:

- uses existing Magento theme selection path.

Cons:

- weakens decoupled storefront boundary,
- couples storefront evolution to Magento runtime internals,
- conflicts with platform-level runtime/profile control intent.

## Consequences

Positive outcomes:

- SEO requirements are addressed from first implementation slices,
- storefront remains independently deployable and replaceable,
- architecture aligns with headless contract boundaries.

Trade-offs:

- higher initial framework/setup complexity than plain SPA,
- requires explicit runtime profile routing and operational documentation.

Risks and limitations:

- profile selection/routing misconfiguration can expose wrong surface,
- premature client-state complexity should be avoided in early slices.

## References

- `docs/ARCHITECTURE_DECISIONS.md`
- `docs/FRONTEND_ARCHITECTURE.md`
- `docs/TECH_STACK.md`
- `docs/STORE_FRONTEND_UX.md`
- `docs/GRAPHQL_CONTRACTS.md`
