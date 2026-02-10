# SECRETS_RULES.md

Status: DRAFT  
Type: Security hygiene policy  
Scope: Repository, CI/CD, and runtime handling of secrets
Authority: Operational checklist; policy authority lives in `docs/SECRETS_MANAGEMENT.md`

## 1. Purpose

This document defines concise enforcement rules for day-to-day implementation.

`docs/SECRETS_MANAGEMENT.md` is the canonical policy and contractual source.

## 2. Core Rules

- Only `.env.example` templates are committed.
- Real secrets are never committed.
- Real secrets are injected at deploy-time (CI) or provisioned on server.
- Secrets must not appear in PR descriptions, issues, comments, screenshots, or logs.

## 3. Repository Policy

Ignored patterns are mandatory and must remain in `.gitignore`:

- `instances/**/.env`
- `instances/**/.env.*`
- `instances/**/secrets*`
- `*.pem`
- `*.key`
- `*.crt`
- `*.p12`

## 4. Required Secret List (Names Only)

- `MAGENTO_DB_PASSWORD`
- `MAGENTO_ADMIN_PASSWORD`
- `MAGENTO_CRYPT_KEY`
- `REDIS_PASSWORD`
- `OPENSEARCH_PASSWORD`
- `SHOP_AGENT_API_TOKEN`
- `CONTROL_PLANE_AGENT_SIGNING_KEY`
- `JWT_SIGNING_KEY`
- `ETSY_API_KEY`
- `ETSY_API_SECRET`

## 5. Handling Requirements

- CI secret stores are the primary injection source.
- Runtime host secret stores are the fallback source.
- Local development uses non-production placeholders in `.env.example`.
- Secret rotation must be possible without code changes.

## 6. Enforcement (Planned)

Add repository secret scanning policy with `security/gitleaks.toml` and CI enforcement.

## 7. Relationship to Other Documents

- Policy authority: `docs/SECRETS_MANAGEMENT.md`
- Scope alignment: `docs/CONTROL_PLANE_AUTHORITY.md`, `docs/PROJECT_STRUCTURE.md`

In case of conflict, `docs/SECRETS_MANAGEMENT.md` overrides this file.
