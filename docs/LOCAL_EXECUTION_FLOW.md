# LOCAL_EXECUTION_FLOW.md

Status: DRAFT
Type: Operations / Execution Procedure
Scope: Local and CI command execution order for Control Plane and Shop Agent slices
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

### Step 2: Validate API Python syntax

```bash
python3 -m py_compile control-plane/api/src/server.py
```

### Step 3: Validate compose configuration

```bash
docker compose -f control-plane/docker-compose.yml config
```

### Step 4: Start control plane runtime

```bash
make cp-up
```

Equivalent:

```bash
docker compose -f control-plane/docker-compose.yml up -d --build
```

### Step 5: Run health checks

```bash
make cp-health
```

Equivalent:

```bash
bash infra/scripts/health-check.sh
curl -fsS http://localhost:8088/health
curl -fsS http://localhost:8088/status
```

### Step 6: Optional runtime logs

```bash
make cp-logs
```

### Step 7: Shutdown

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
2. Validate compose config
3. Build and start containers
4. Wait until `/health` is reachable
5. Run `infra/scripts/health-check.sh`
6. Dump logs on failure
7. Shutdown containers

## 4. Local Execution Order (Shop Agent)

### Step 1: Validate Python syntax

```bash
python3 -m py_compile backend/shop-agent/src/server.py
```

### Step 2: Run automated tests

```bash
python3 -m unittest discover -s backend/shop-agent/tests -p "test_*.py"
```

### Step 3: Build container image

```bash
docker build -t shop-agent:test backend/shop-agent
```

### Step 4: Start runtime with injected auth config

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

### Step 5: Run endpoint checks

```bash
curl -fsS http://localhost:8091/health
curl -fsS -H "Authorization: Bearer <signed-jwt>" http://localhost:8091/status
curl -fsS -X POST -H "Authorization: Bearer <signed-jwt>" http://localhost:8091/verify/smoke
```

### Step 6: Shutdown runtime

```bash
docker rm -f shop-agent-local
```

## 5. CI Execution Order (Shop Agent)

The workflow in `.github/workflows/shop-agent.yml` executes in this order:

1. Checkout repository
2. Validate Python syntax
3. Run unit tests
4. Build container image
5. Start container with injected runtime auth config
6. Wait for `/health`
7. Generate signed short-lived token in workflow context
8. Verify `/status` and `/verify/smoke` with authorized calls
9. Dump logs on failure
10. Shutdown container

## 6. Local Execution Order (Automated Multi-Store Bootstrap)

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

## 7. Local Execution Order (Single Store Manual Path)

### Step 1: Prepare runtime env file

```bash
cp instances/shop-001/.env.example instances/shop-001/.env
```

Inject runtime values in `instances/shop-001/.env` for:

- Magento source mode (`composer` or `git`) and corresponding source credentials/refs,
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

### Step 4: Verify storefront and agent

```bash
curl -fsS http://localhost:8181
curl -fsS http://localhost:8191/health
```

Optional status code check:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8181
docker compose --env-file instances/shop-001/.env \
  -f instances/shop-001/docker-compose.override.yml ps
```

### Step 5: Shutdown runtime

```bash
docker compose --env-file instances/shop-001/.env \
  -f instances/shop-001/docker-compose.override.yml down --remove-orphans
```

## 8. Notes

- Docker daemon must be running locally before startup commands.
- Health gate is considered passing only when both `/health` and `/status` checks succeed.
- Runtime credential/config values are never stored in repository files.
- Use placeholders in local command history/examples; inject real values at runtime only.

## 9. Relationship to Other Documents

This document depends on:

- `INSTALLATION.md`
- `RUNBOOK.md`
- `CI_CD_OVERVIEW.md`
- `DEPLOYMENT_PIPELINE.md`

In case of conflict, contractual docs take precedence.

## 10. Document Status

This document is DRAFT

No freeze applied

Execution order may evolve as implementation grows.

End of document
