# LOCAL_EXECUTION_FLOW.md

Status: DRAFT
Type: Operations / Execution Procedure
Scope: Local and CI command execution order for Control Plane bootstrap slice
Freeze: Not applied

## 1. Purpose

This document records the exact command order used to execute and validate the current Control Plane implementation slice.

## 2. Local Execution Order

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

## 4. Notes

- Docker daemon must be running locally before startup commands.
- Health gate is considered passing only when both `/health` and `/status` checks succeed.

## 5. Relationship to Other Documents

This document depends on:

- `INSTALLATION.md`
- `RUNBOOK.md`
- `CI_CD_OVERVIEW.md`
- `DEPLOYMENT_PIPELINE.md`

In case of conflict, contractual docs take precedence.

## 6. Document Status

This document is DRAFT

No freeze applied

Execution order may evolve as implementation grows.

End of document
