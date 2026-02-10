# ADMIN_UX.md

Status: DRAFT
Type: Conceptual / UX Contract
Scope: Store administrator (merchant admin) experience
Freeze: Not applied

## 1. Purpose

This document defines the store administrator (merchant admin) experience.

Its goals are to:

- describe what store administrators can do,
- define logical admin surfaces and workflows,
- separate store administration from platform operations.

This document does not:

- define UI layout or design,
- define platform operator workflows,
- define specific backend implementation,
- define API contracts.

## 2. Admin Scope

The store admin experience covers:

- product and catalog management,
- pricing and availability management,
- content configuration relevant to storefront,
- order visibility and operational handling at a store level (conceptual).

It excludes:

- infrastructure provisioning,
- deployment operations,
- platform-wide configuration,
- cross-store management.

## 3. Admin User Types

### 3.1 Store Administrator (Primary)

A store administrator may:

- manage products and variants,
- manage category/collection structures,
- manage store configuration relevant to storefront,
- manage content surfaces.

### 3.2 Store Staff (Optional / Future)

A limited-role user may:

- view orders,
- perform operational handling tasks,
- have restricted write access.

Role modeling is out of scope here.

## 4. High-Level Admin Journeys

The admin experience supports:

- Store setup and configuration
- Product creation and maintenance
- Variant definition and maintenance
- Pricing updates
- Availability and inventory updates
- Storefront content updates
- Order review and handling
- Monitoring store status (store-local, not platform)

Journeys are conceptual and do not prescribe UI flow.

## 5. Admin Surface Taxonomy

### 5.1 Catalog Management Surfaces

Logical surfaces for:

- product listing
- product create/edit
- variant create/edit
- attribute assignment
- category/collection assignment

### 5.2 Pricing Surfaces

Logical surfaces for:

- base pricing updates
- promotional pricing entry (conceptual)
- price visibility rules (conceptual)

Pricing algorithms are out of scope.

### 5.3 Inventory & Availability Surfaces

Logical surfaces for:

- inventory quantity input (conceptual)
- in-stock/out-of-stock status control
- purchase eligibility control

Inventory and availability boundaries are defined in:

`PRODUCT_MODEL.md`

### 5.4 Storefront Content Surfaces

Logical surfaces for:

- product media and descriptions
- landing/collection presentation content (conceptual)
- informational pages (policy/legal/about)

Content rendering details are out of scope.

### 5.5 Order Handling Surfaces (Conceptual)

Logical surfaces for:

- viewing orders
- updating order handling status (conceptual)
- issuing operational actions (conceptual)

This document does not define payment or fulfillment workflows.

### 5.6 Store Configuration Surfaces

Logical surfaces for:

- store identity and metadata
- storefront-facing settings
- integration toggles (conceptual)

Infrastructure configuration is forbidden here.

## 6. Admin Boundaries & Constraints

### 6.1 Store Admin vs Platform Operator

Store admin must not:

- provision infrastructure,
- trigger deployments,
- access other stores,
- access platform secrets,
- expand privileges.

Platform operations are handled by the Control Plane.

### 6.2 Store Admin vs Business Data Sensitivity

Admins may view store-local operational data needed for store operation.

Admins must not:

- export sensitive datasets outside intended workflows,
- access secrets,
- access platform-level operational metadata for other stores.

Security constraints are governed by:

`SECURITY_MODEL.md`

## 7. Consistency Requirements

Admin actions must be:

- explicit,
- traceable (auditable),
- reversible where applicable.

Admin changes must not require:

- direct database access,
- manual runtime changes.

## 8. Error & Edge Case Handling (Conceptual)

Admin UX must handle:

- invalid product definitions,
- conflicting variant attributes,
- unavailable inventory states,
- failed updates.

Errors must:

- be user-readable,
- not expose internal details,
- not leak secrets.

## 9. Integration Considerations (Conceptual)

Admin may:

- enable/disable integration features at a store level (conceptual),
- view integration status signals (conceptual).

Admin must not:

- manage integration credentials directly in unsafe ways,
- bypass platform secrets handling rules.

Integration boundaries are governed by:

- `SECRETS_MANAGEMENT.md`
- `SECURITY_MODEL.md`

## 10. Non-Goals

This document does not define:

- RBAC model implementation,
- payment configuration details,
- shipping/fulfillment workflows,
- analytics dashboards,
- platform operator UI.

## 11. Relationship to Other Documents

This document is authoritative for:

- conceptual store admin workflows and scope

This document depends on:

- `PROJECT_VISION.md`
- `PRODUCT_MODEL.md`
- `SECURITY_MODEL.md`

This document informs:

- `GRAPHQL_CONTRACTS.md` (where admin-facing data surfaces intersect)
- store backend configuration documentation (future)

In case of conflict:

authority and security documents take precedence.

## 12. Change Management

Changes to admin UX scope:

- must be documented,
- require an ADR entry if architectural,
- must preserve store vs platform separation.

## 13. Document Status

This document is DRAFT

No freeze applied

Admin UX scope is binding once accepted

Implementation must conform

End of document
