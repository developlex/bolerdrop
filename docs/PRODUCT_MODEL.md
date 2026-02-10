# PRODUCT_MODEL.md

Status: DRAFT
Type: Conceptual / Domain Model
Scope: Product, variant, pricing, and inventory concepts
Freeze: Not applied

## 1. Purpose

This document defines the conceptual product model used by the platform.

Its goals are to:

- establish a shared vocabulary for products and variants,
- define boundaries between product-related concepts,
- prevent ad-hoc or inconsistent product representations.

This document does not:

- define implementation details,
- prescribe database schemas,
- define UI behavior,
- define platform-specific APIs.

## 2. Product Model Scope

The product model covers:

- products and variants,
- pricing representation,
- availability and inventory concepts,
- categorization and discovery metadata.

The product model applies to:

- storefront behavior,
- admin operations,
- integrations and external systems.

## 3. Core Product Concepts

### 3.1 Product

A Product represents a sellable commercial entity.

Characteristics:

- has a unique identity,
- represents a customer-facing offering,
- may have one or more variants,
- is discoverable via storefront surfaces.

A product exists independently of pricing or inventory state.

### 3.2 Variant

A Variant represents a concrete purchasable form of a product.

Characteristics:

- belongs to exactly one product,
- represents a specific combination of attributes,
- is the unit that is added to cart and purchased.

Variants are the atomic sellable units.

### 3.3 Attribute

An Attribute describes a dimension along which variants differ.

Examples (conceptual only):

- size
- color
- material

Rules:

- attributes describe variants, not products,
- attribute semantics must be consistent within a product.

## 4. Pricing Model (Conceptual)

Pricing is treated as a separate concern from product identity.

Characteristics:

- pricing applies at the variant level,
- pricing may change independently of product definition,
- pricing does not define product existence.

Pricing concepts may include:

- base price,
- promotional adjustments,
- currency context.

Pricing logic is intentionally unspecified.

## 5. Inventory & Availability

Inventory and availability are distinct but related concepts.

### 5.1 Inventory

Inventory represents:

- quantity tracking,
- stock levels,
- replenishment state.

Inventory is managed per variant.

### 5.2 Availability

Availability represents:

- whether a variant can be purchased,
- whether it is visible to customers,
- whether it can be added to cart.

Availability is derived from inventory and other conditions.

## 6. Product State & Lifecycle

Products and variants may exist in different states, such as:

- draft
- active
- inactive
- discontinued

State transitions:

- are explicit,
- are controlled by administrators,
- do not imply deletion.

State semantics are consistent across the platform.

## 7. Categorization & Discovery

Products may be associated with:

- categories,
- collections,
- tags or labels.

These associations:

- affect discoverability,
- do not affect product identity,
- do not affect variant structure.

Categorization is orthogonal to pricing and inventory.

## 8. Media & Content (Conceptual)

Products may reference:

- images,
- descriptions,
- rich content.

Content:

- enhances presentation,
- does not define sellability,
- does not affect variant identity.

Media handling is outside the scope of this document.

## 9. Product vs Cart vs Order Boundary

Clear boundaries exist between:

Product Model  
(what can be sold)

Cart Model  
(what a customer intends to buy)

Order Model  
(what has been purchased)

This document defines only the Product Model.

## 10. Integration Considerations

External systems (e.g., ECI):

- interact with products via documented contracts,
- must respect product and variant boundaries,
- must not bypass product lifecycle rules.

Product model consistency is mandatory across integrations.

## 11. Non-Goals

This document does not define:

- discount algorithms,
- tax calculation,
- fulfillment workflows,
- shipping logic,
- payment logic.

These concerns are handled elsewhere.

## 12. Relationship to Other Documents

This document is authoritative for:

- product-related concepts and vocabulary

This document depends on:

- `PROJECT_VISION.md`
- `ARCHITECTURE_DECISIONS.md`

This document informs:

- `STORE_FRONTEND_UX.md`
- `ADMIN_UX.md`
- `GRAPHQL_CONTRACTS.md`

In case of conflict, architectural and security documents take precedence.

## 13. Change Management

Changes to the product model:

- must be documented,
- require an ADR entry,
- must preserve conceptual consistency.

## 14. Document Status

This document is DRAFT

No freeze applied

Product model definitions are binding once accepted

Implementation must conform

End of document
