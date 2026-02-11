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

## 6. Notes

- Docker daemon must be running locally before startup commands.
- Health gate is considered passing only when both `/health` and `/status` checks succeed.
- Runtime credential/config values are never stored in repository files.
- Use placeholders in local command history/examples; inject real values at runtime only.

## 7. Relationship to Other Documents

This document depends on:

- `INSTALLATION.md`
- `RUNBOOK.md`
- `CI_CD_OVERVIEW.md`
- `DEPLOYMENT_PIPELINE.md`

In case of conflict, contractual docs take precedence.

## 8. Document Status

This document is DRAFT

No freeze applied

Execution order may evolve as implementation grows.

End of document
