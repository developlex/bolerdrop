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

## Quick Bootstrap (Local)

Provision and launch multiple store instances with one command:

```bash
make platform-bootstrap INSTANCES=<instance-count>
```

This flow:

- allocates available local ports per instance,
- creates/updates `instances/<store-id>/` runtime files,
- injects runtime-only values into local `.env` files (ignored by git),
- installs and starts each requested store runtime slice.

### Storefront Toggle Per Instance

Each instance supports a one-flag storefront toggle in `instances/<store-id>/.env`:

```bash
STOREFRONT_ENABLED=1
```

- `1`: start decoupled storefront container (`http://localhost:<storefront-port>`)
- `0`: do not run decoupled storefront; use Magento frontend only (`http://localhost:<magento-port>`)

After changing the flag, rerun instance bootstrap/install for that store:

```bash
bash infra/scripts/install-magento.sh <store-id>
```

## Installation and Validation (Local)

Use this order for deterministic local setup:

1. Provision or bootstrap instances:

```bash
make platform-provision INSTANCES=<instance-count>
# or
make platform-bootstrap INSTANCES=<instance-count>
```

2. Verify runtime endpoints for each started instance:

```bash
curl -fsS http://localhost:<magento-port>
curl -fsS http://localhost:<storefront-port>
curl -fsS http://localhost:<shop-agent-port>/health
```

3. Run quality gates before pushing:

```bash
# Control Plane
python3 -m pip install --upgrade pip ruff mypy
python3 infra/scripts/python-standards-check.py control-plane/api/src
ruff check control-plane/api/src infra/scripts/python-standards-check.py
mypy --python-version 3.14 control-plane/api/src/server.py infra/scripts/python-standards-check.py
python3 -m py_compile control-plane/api/src/server.py

# Shop Agent
python3 -m pip install --upgrade pip ruff mypy
python3 infra/scripts/python-standards-check.py backend/shop-agent/src backend/shop-agent/tests
ruff check backend/shop-agent/src backend/shop-agent/tests infra/scripts/python-standards-check.py
mypy --python-version 3.14 backend/shop-agent/src/server.py
python3 -m unittest discover -s backend/shop-agent/tests -p "test_*.py"

# Storefront
cd frontend/storefront
npm ci
npm run check:standards
npm run test
npm run typecheck
npm run build
```

4. Rebuild changed services and re-check health:

```bash
docker compose --env-file instances/<store-id>/.env \
  -f instances/<store-id>/docker-compose.override.yml up -d --build
docker compose --env-file instances/<store-id>/.env \
  -f instances/<store-id>/docker-compose.override.yml ps
```

Command-level execution details are tracked in:

- `docs/LOCAL_EXECUTION_FLOW.md`

## Documentation Authority

The root governance and precedence rules are defined in:

- `AGENT.md`

If documentation and implementation diverge, higher-authority documentation governs.

Delivery workflow and branch/PR policy are defined in:

- `docs/GIT_WORKFLOW.md`
