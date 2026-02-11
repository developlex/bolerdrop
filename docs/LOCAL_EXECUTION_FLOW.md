# LOCAL_EXECUTION_FLOW.md

Status: DRAFT
Type: Operations / Execution Procedure
Scope: Local and CI command execution order for Control Plane, Shop Agent, Storefront, and store runtime slices
Freeze: Not applied

## 1. Purpose

This document records the exact command order used to execute and validate current implementation slices.

## 2. Local Execution Order (Control Plane)

### Step 1: Validate shell scripts

```bash
bash -n infra/scripts/new-shop.sh
bash -n infra/scripts/bootstrap-platform.sh
bash -n infra/scripts/health-check.sh
bash -n infra/scripts/reset-instance.sh
```

### Step 2: Install Python quality tools (once per environment)

```bash
python3 -m pip install --upgrade pip ruff mypy
```

### Step 3: Run Python standards and static checks

```bash
python3 infra/scripts/python-standards-check.py control-plane/api/src
ruff check control-plane/api/src infra/scripts/python-standards-check.py
mypy --python-version 3.14 control-plane/api/src/server.py infra/scripts/python-standards-check.py
```

### Step 4: Validate API Python syntax

```bash
python3 -m py_compile control-plane/api/src/server.py
```

### Step 5: Validate compose configuration

```bash
docker compose -f control-plane/docker-compose.yml config
```

### Step 6: Start control plane runtime

```bash
make cp-up
```

Equivalent:

```bash
docker compose -f control-plane/docker-compose.yml up -d --build
```

### Step 7: Run health checks

```bash
make cp-health
```

Equivalent:

```bash
bash infra/scripts/health-check.sh
curl -fsS http://localhost:8088/health
curl -fsS http://localhost:8088/status
```

### Step 8: Optional runtime logs

```bash
make cp-logs
```

### Step 9: Shutdown

```bash
make cp-down
```

Equivalent:

```bash
docker compose -f control-plane/docker-compose.yml down --remove-orphans
```

## 3. CI Execution Order

The workflow in `.github/workflows/control-plane.yml` executes in this order:

1. Checkout repository
2. Setup Python 3.14
3. Install Python quality tools
4. Run Python standards gate (`python-standards-check.py`)
5. Run `ruff` static checks
6. Run `mypy` static type checks (first-party sources)
7. Validate compose config
8. Build and start containers
9. Wait until `/health` is reachable
10. Run `infra/scripts/health-check.sh`
11. Dump logs on failure
12. Shutdown containers

## 4. Local Execution Order (Shop Agent)

### Step 1: Install Python quality tools (once per environment)

```bash
python3 -m pip install --upgrade pip ruff mypy
```

### Step 2: Run Python standards and static checks

```bash
python3 infra/scripts/python-standards-check.py backend/shop-agent/src backend/shop-agent/tests
ruff check backend/shop-agent/src backend/shop-agent/tests infra/scripts/python-standards-check.py
mypy --python-version 3.14 backend/shop-agent/src/server.py
```

### Step 3: Validate Python syntax

```bash
python3 -m py_compile backend/shop-agent/src/server.py
```

### Step 4: Run automated tests

```bash
python3 -m unittest discover -s backend/shop-agent/tests -p "test_*.py"
```

### Step 5: Build container image

```bash
docker build -t shop-agent:test backend/shop-agent
```

### Step 6: Start runtime with injected auth config

```bash
docker run -d --rm \
  --name shop-agent-local \
  -p 8091:8080 \
  -e STORE_ID=<store-id> \
  -e SHOP_AGENT_VERSION=<agent-version> \
  -e DEPLOYMENT_VERSION=<deployment-version> \
  -e AGENT_AUTH_MODE=jwt \
  -e AGENT_JWT_SECRET=<jwt-secret> \
  -e AGENT_JWT_ISSUER=<jwt-issuer> \
  -e AGENT_JWT_AUDIENCE=<jwt-audience> \
  -e AGENT_JWT_LEEWAY_SECONDS=<seconds> \
  -e AGENT_JWT_MAX_TTL_SECONDS=<seconds> \
  shop-agent:test
```

### Step 7: Run endpoint checks

```bash
curl -fsS http://localhost:8091/health
curl -fsS -H "Authorization: Bearer <signed-jwt>" http://localhost:8091/status
curl -fsS -X POST -H "Authorization: Bearer <signed-jwt>" http://localhost:8091/verify/smoke
```

### Step 8: Shutdown runtime

```bash
docker rm -f shop-agent-local
```

## 5. CI Execution Order (Shop Agent)

The workflow in `.github/workflows/shop-agent.yml` executes in this order:

1. Checkout repository
2. Setup Python 3.14
3. Install Python quality tools
4. Run Python standards gate (`python-standards-check.py`)
5. Run `ruff` static checks
6. Run `mypy` static type checks (first-party sources)
7. Validate Python syntax
8. Run unit tests
9. Build container image
10. Start container with injected runtime auth config
11. Wait for `/health`
12. Generate signed short-lived token in workflow context
13. Verify `/status` and `/verify/smoke` with authorized calls
14. Dump logs on failure
15. Shutdown container

## 6. Local Execution Order (Storefront)

### Step 1: Install dependencies

```bash
cd frontend/storefront
npm ci
```

### Step 2: Validate dependency freshness (recommended before release)

```bash
npm outdated
```

### Step 3: Run standards checks, tests, type checks, and production build

```bash
npm run check:standards
npm run test
npm run typecheck
npm run build
```

### Step 4: Build runtime image

```bash
docker build -t storefront:test frontend/storefront
```

### Step 5: Verify storefront runtime endpoint

```bash
docker run --rm -p 8281:3000 \
  -e COMMERCE_GRAPHQL_URL=http://localhost:8181/graphql \
  -e STOREFRONT_BASE_URL=http://localhost:8281 \
  -e HOSTNAME=0.0.0.0 \
  storefront:test
```

In a separate terminal:

```bash
curl -fsS http://localhost:8281
curl -fsS http://localhost:8281/api/health
```

### Step 6: Stop local storefront runtime

Use `Ctrl+C` in the foreground `docker run` terminal.

## 7. Local Execution Order (Automated Multi-Store Bootstrap)

### Step 1: Provision-only dry run (non-destructive)

```bash
make platform-provision INSTANCES=<instance-count>
```

Equivalent:

```bash
bash infra/scripts/bootstrap-platform.sh --count <instance-count> --provision-only
```

### Step 2: Launch all requested stores with one command

```bash
make platform-bootstrap INSTANCES=<instance-count>
```

Equivalent:

```bash
bash infra/scripts/bootstrap-platform.sh --count <instance-count>
```

Execution behavior:

1. optionally starts Control Plane runtime,
2. creates missing `instances/<store-id>/` directories from shared templates,
3. allocates available host ports per store automatically,
4. writes non-secret `.env.example` and runtime `.env` files per store,
5. installs and starts each store runtime sequentially.

Optional variants:

```bash
# Start runtime containers only (skip Magento install)
make platform-bootstrap INSTANCES=<instance-count> NO_INSTALL=1

# Do not start Control Plane
make platform-bootstrap INSTANCES=<instance-count> NO_CONTROL_PLANE=1
```

## 8. Local Execution Order (Single Store Manual Path)

### Step 1: Prepare runtime env file

```bash
cp instances/shop-001/.env.example instances/shop-001/.env
```

Inject runtime values in `instances/shop-001/.env` for:

- Magento source mode (`composer` or `git`) and corresponding source credentials/refs,
- storefront runtime port/base-url values,
- database/admin bootstrap values,
- Shop Agent JWT values.

### Step 2: Validate installer script syntax

```bash
bash -n infra/scripts/install-magento.sh
```

### Step 3: Start runtime + install Magento

```bash
bash infra/scripts/install-magento.sh shop-001
```

Installer execution order:

1. validates required runtime keys and rejects placeholder values,
2. starts store runtime via compose (`up -d --build`),
3. waits for MySQL/OpenSearch readiness,
4. installs Magento source (Composer mode or Git mode),
5. normalizes runtime filesystem ownership for web runtime compatibility,
6. runs `bin/magento setup:install` if instance is not installed,
7. runs post-install upgrade/cache flush as non-root application user.

Runtime notes:

- `magento-cron` runs `bin/magento cron:run` every minute inside the stack.
- This is the containerized equivalent of Adobe's crontab guidance for Magento.

### Step 4: Verify Magento, storefront, and agent

```bash
curl -fsS http://localhost:8181
curl -fsS http://localhost:8281
curl -fsS http://localhost:8191/health
```

Optional status code check:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8181
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8281
docker compose --env-file instances/shop-001/.env \
  -f instances/shop-001/docker-compose.override.yml ps
```

### Step 5: Shutdown runtime

```bash
docker compose --env-file instances/shop-001/.env \
  -f instances/shop-001/docker-compose.override.yml down --remove-orphans
```

## 9. Local Execution Order (Storefront Dependency Upgrade Path)

Use this sequence whenever frontend dependencies are upgraded.

### Step 1: Update dependency definitions

Edit `frontend/storefront/package.json` to target selected versions.

### Step 2: Regenerate lock file and install

```bash
cd frontend/storefront
npm install
```

### Step 3: Validate quality gates

```bash
npm run check:standards
npm run test
npm run typecheck
npm run build
```

### Step 4: Rebuild integrated runtime service

```bash
docker compose --env-file instances/shop-001/.env \
  -f instances/shop-001/docker-compose.override.yml up -d --build storefront
```

### Step 5: Verify runtime behavior and health state

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8281
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8281/api/health
docker compose --env-file instances/shop-001/.env \
  -f instances/shop-001/docker-compose.override.yml ps storefront
```

Expected outcome:

- storefront root returns `200`,
- `/api/health` returns `200`,
- container status reports `healthy`.

## 10. Notes

- Docker daemon must be running locally before startup commands.
- Health gate is considered passing only when both `/health` and `/status` checks succeed.
- Runtime credential/config values are never stored in repository files.
- Use placeholders in local command history/examples; inject real values at runtime only.
- For JavaScript runtimes, use current LTS profile by default unless a contract document states otherwise.

## 11. Relationship to Other Documents

This document depends on:

- `INSTALLATION.md`
- `RUNBOOK.md`
- `CI_CD_OVERVIEW.md`
- `DEPLOYMENT_PIPELINE.md`

In case of conflict, contractual docs take precedence.

## 12. Document Status

This document is DRAFT

No freeze applied

Execution order may evolve as implementation grows.

End of document
