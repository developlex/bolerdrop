# MAGENTO_PLUGIN_STRATEGY.md

Status: DRAFT
Type: Plugin Strategy / Implementation Guidance
Scope: Marketplace extension selection for low-custom-code delivery
Freeze: Not applied

## 1. Purpose

This document defines the Magento extension strategy for the platform.

Its goals are to:

- minimize custom code for core commerce capabilities,
- select stable, compatible extensions with clear ownership,
- keep security, isolation, and operational constraints intact.

This document does not:

- lock exact commercial pricing,
- replace vendor documentation,
- define extension internals.

## 2. Selection Principles

Extensions selected for implementation should satisfy:

- Magento Open Source 2.4 compatibility,
- compatibility with the chosen runtime profile (PHP + Apache/Nginx + OpenSearch),
- stable release channel on Marketplace,
- recent maintenance activity,
- clear operational/security posture,
- no violation of platform isolation and authority contracts.

Preference order:

1. First-party Adobe extensions
2. Widely adopted and actively maintained third-party extensions
3. Custom code only when no viable extension exists

## 3. Recommended Baseline for Current Scope

Decision snapshot date: 2026-02-10

Source set reviewed:

- Magento Open Source overview (`magento-opensource.com`)
- Adobe Commerce Marketplace extension catalog
- Adobe Payment Services marketplace listing
- Adobe system requirements references

### 3.1 Payments (Primary Choice)

Recommended:

- Adobe Payment Services  
  https://commercemarketplace.adobe.com/magento-payment-services.html

Rationale:

- first-party Adobe extension,
- explicit Magento Open Source 2.4 compatibility,
- payment-provider model aligned with reduced PCI handling in custom code,
- active release cadence and quality-report checks.

### 3.2 Payments (Fallback by Region or PSP Requirement)

Use only if Payment Services is not suitable for business constraints:

- Fastlane by PayPal for Braintree  
  https://commercemarketplace.adobe.com/paypal-module-fastlane.html
- Airwallex Payments  
  https://commercemarketplace.adobe.com/airwallex-payments-plugin-magento.html
- Saferpay by Worldline  
  https://commercemarketplace.adobe.com/saferpay-package.html

Constraint:

- only one primary checkout payment path should be enabled initially to reduce operational complexity.

### 3.3 Marketplace Integration (Etsy)

Recommended:

- Webkul Etsy Integration  
  https://commercemarketplace.adobe.com/webkul-etsy-magento-integration.html

Alternative:

- CedCommerce Etsy Integration  
  https://commercemarketplace.adobe.com/ced-etsy-magento2-integration.html

Constraint:

- pick one connector initially; do not run multiple Etsy connectors simultaneously.

### 3.4 Search and Discovery Strategy

Default:

- native Magento + OpenSearch (no extra plugin required for initial release).

Optional phase-2 search enhancements (if needed):

- Algolia Instant Search  
  https://commercemarketplace.adobe.com/algolia-algoliasearch-magento-2.html

Constraint:

- keep one active search stack to avoid dual-index complexity.
- do not introduce Adobe Live Search in Magento Open Source scope (Adobe Commerce-only compatibility profile).

### 3.5 Initial Implementation Decision (Low-Custom-Code)

Initial plugin baseline for implementation start:

1. Adobe Payment Services (primary payments)
2. One Etsy connector only (Webkul preferred, CedCommerce fallback)
3. No additional search plugin in phase 1

All other plugin additions are deferred until post-smoke operational stability.

## 4. Built-In Before Plugin Rule

Before adding an extension, validate whether Magento core already provides the requirement:

- Admin 2FA and baseline security controls
- core catalog, product, and inventory management
- core shipping carrier integrations where available

If core capability is sufficient, do not add extension surface area.

## 5. Plugin Onboarding Procedure (Conceptual)

For each plugin candidate:

1. Verify compatibility and release recency on Marketplace.
2. Verify compatibility against the current Magento system requirements profile.
3. Review security posture and data handling expectations.
4. Validate no forbidden authority expansion (Control Plane, Shop Agent).
5. Install in non-production only.
6. Run smoke tests and rollback test.
7. Document config ownership and operational runbook notes.

## 6. Security and Data Constraints

All extension usage must comply with:

- `SECURITY_MODEL.md`
- `SECURITY_THREAT_MODEL.md`
- `SECRETS_MANAGEMENT.md`
- `DATA_LIFECYCLE.md`

Hard rules:

- no secret values in repo config,
- no cross-store data leakage,
- no hidden admin/debug surfaces,
- no extension that bypasses documented operational boundaries.

## 7. Relationship to Other Documents

This document depends on:

- `TECH_STACK.md`
- `INTEGRATION_MODEL.md`
- `SHOP_AGENT_API.md`
- `GRAPHQL_CONTRACTS.md`
- `RUNBOOK.md`

In case of conflict, security and authority documents take precedence.

## 8. Change Management

Plugin strategy changes:

- must be documented here,
- require ADR when architecture/security boundaries are affected,
- must preserve low-custom-code and isolation goals.

## 9. Document Status

This document is DRAFT

No freeze applied

Plugin selections become binding once accepted.

End of document
