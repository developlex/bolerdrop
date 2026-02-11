# BoilerDrop

BoilerDrop is a commerce platform blueprint with strict separation between:

- store runtime instances,
- a centralized control plane,
- infrastructure templates,
- contractual documentation in `docs/`.

## Repository Map

- `docs/`: architecture, security, operations, and API contracts
- `backend/`: Magento runtime extensions and Shop Agent boundary service
- `frontend/`: storefront frontend application
- `control-plane/`: platform orchestration API and UI
- `infra/`: deployment/runtime templates and scripts
- `instances/`: per-store runtime configuration templates

## Security Documentation

The platform-wide security threat model is defined in:

- `docs/SECURITY_THREAT_MODEL.md`

Related security contracts:

- `docs/SECURITY_MODEL.md`
- `docs/SECRETS_MANAGEMENT.md`
- `docs/CONTROL_PLANE_AUTHORITY.md`
- `docs/SHOP_AGENT_API.md`

## Commerce Runtime Notes

- Magento runtime is PHP-based and requires a web tier profile (`Apache` or `Nginx`) plus supporting services.
- Extension/plugin baseline and low-custom-code decisions are tracked in `docs/MAGENTO_PLUGIN_STRATEGY.md`.

## Documentation Authority

The root governance and precedence rules are defined in:

- `AGENT.md`

If documentation and implementation diverge, higher-authority documentation governs.
