# STOREFRONT_FUNCTIONALITY_MATRIX.md

Status: DRAFT  
Type: Execution / Coverage Matrix  
Scope: Magento storefront baseline parity against decoupled storefront  
Freeze: Not applied

## 1. Purpose

This document tracks functional coverage between Magento's baseline storefront capabilities and the decoupled storefront implementation.

Goals:

- prevent hidden functionality gaps,
- make implementation status explicit,
- prioritize parity work with clear sequencing.

## 2. Status Definitions

- `Implemented`: End-user flow is available and runnable.
- `Partial`: Flow exists but is incomplete or missing critical sub-capabilities.
- `Missing`: No runnable flow is currently implemented.

## 3. Coverage Matrix

| Capability | Status | Coverage Notes | Primary Paths |
|---|---|---|---|
| Catalog browsing | Implemented | Catalog listing and product details are wired to Magento GraphQL. | `frontend/storefront/src/lib/commerce/catalog.ts`, `frontend/storefront/app/page.tsx`, `frontend/storefront/app/product/[urlKey]/page.tsx` |
| Catalog search | Implemented | Query-based search via `?q=` is supported for catalog list and pagination routes. | `frontend/storefront/src/lib/commerce/catalog.ts`, `frontend/storefront/src/components/catalog-page-view.tsx`, `frontend/storefront/app/page.tsx`, `frontend/storefront/app/page/[page]/page.tsx` |
| Pagination | Implemented | Canonical pagination path `/page/<n>` with redirect from `?page=`. | `frontend/storefront/src/lib/commerce/pagination.ts`, `frontend/storefront/app/page.tsx`, `frontend/storefront/app/page/[page]/page.tsx` |
| Product detail | Implemented | Product detail route + schema metadata + add-to-cart action entrypoint. | `frontend/storefront/app/product/[urlKey]/page.tsx`, `frontend/storefront/app/actions/cart.ts` |
| Cart create/read | Implemented | Cart is created lazily and rendered with item/total details. | `frontend/storefront/src/lib/commerce/cart.ts`, `frontend/storefront/app/cart/page.tsx` |
| Cart update quantity | Missing | No customer-facing update quantity action yet. | N/A |
| Cart remove item | Missing | No customer-facing remove-item action yet. | N/A |
| Guest checkout placement | Partial | Address/payment/order placement exists, but fallback UX for zero shipping methods remains. | `frontend/storefront/app/actions/checkout.ts`, `frontend/storefront/app/cart/page.tsx` |
| Order confirmation | Implemented | Dedicated confirmation surface is available after successful checkout. | `frontend/storefront/app/order/confirmation/page.tsx` |
| Customer login/logout | Implemented | Customer token generation and logout flow are available. | `frontend/storefront/app/login/page.tsx`, `frontend/storefront/app/actions/account.ts` |
| Customer registration | Implemented | Registration route/action is available with create-account + auto-login handoff, prefilled non-sensitive retry fields, and Magento-aligned password hints/strength UX (min length + trim-aware validation). | `frontend/storefront/app/register/page.tsx`, `frontend/storefront/src/components/register-password-fields.tsx`, `frontend/storefront/app/actions/account.ts`, `frontend/storefront/src/lib/commerce/customer.ts` |
| Customer account profile | Implemented | Dashboard + account information edit + password update + address book CRUD + newsletter preference are wired to Magento customer APIs; password forms include visibility toggles and strength/min-length guidance aligned to registration UX; address save resolves Magento-required `region_id` for strict country/state validation. | `frontend/storefront/app/account/page.tsx`, `frontend/storefront/app/account/edit/page.tsx`, `frontend/storefront/app/account/password/page.tsx`, `frontend/storefront/app/account/addresses/page.tsx`, `frontend/storefront/app/account/newsletter/page.tsx`, `frontend/storefront/app/actions/account-management.ts`, `frontend/storefront/src/components/account-password-fields.tsx`, `frontend/storefront/src/components/register-password-fields.tsx`, `frontend/storefront/src/lib/commerce/customer.ts` |
| Customer order history | Implemented | Dedicated orders route lists Magento customer orders with status and totals. | `frontend/storefront/app/account/orders/page.tsx`, `frontend/storefront/src/lib/commerce/customer.ts` |
| Customer order detail | Implemented | Order detail route resolves Magento order by number with items and billing/shipping data. | `frontend/storefront/app/account/orders/[number]/page.tsx`, `frontend/storefront/src/lib/commerce/customer.ts` |
| Wishlist (add/view/remove) | Implemented | Wishlist add is now available from product/catalog surfaces and account page supports Magento-backed list, quantity update, and remove. | `frontend/storefront/app/actions/wishlist.ts`, `frontend/storefront/app/product/[urlKey]/page.tsx`, `frontend/storefront/src/components/product-card.tsx`, `frontend/storefront/app/account/wishlist/page.tsx`, `frontend/storefront/app/actions/account-management.ts` |
| Newsletter subscribe | Implemented | Account newsletter page supports subscribe/unsubscribe via Magento customer mutation. | `frontend/storefront/app/account/newsletter/page.tsx`, `frontend/storefront/app/actions/account-management.ts` |
| Storefront theme switching | Implemented | Env-selected theme + immediate runtime switch via top-bar toggle (cookie-persisted), with optional `?theme=` compatibility flow for direct links. | `frontend/storefront/src/themes/themes.ts`, `frontend/storefront/proxy.ts`, `frontend/storefront/app/layout.tsx`, `frontend/storefront/src/components/theme-switcher.tsx` |
| Theme debug visibility | Implemented | Active theme and source (cookie/env) exposed via debug endpoint. | `frontend/storefront/app/api/theme/route.ts` |

## 4. Immediate Priority Queue

1. Implement cart mutation controls (update quantity + remove item).
2. Add checkout fallback UX for carts with zero available shipping methods.
3. Add integration smoke coverage for product -> cart -> checkout placement.
4. Document GraphQL error-code mapping for checkout and account mutations.

## 5. Relationship to Other Documents

This document is informed by:

- `docs/STORE_FRONTEND_UX.md`
- `docs/GRAPHQL_CONTRACTS.md`
- `docs/IMPLEMENTATION_ROADMAP.md`

In case of conflict, contractual documents take precedence.

## 6. Document Status

This document is DRAFT.
No freeze applied.

End of document
