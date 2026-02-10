#!/usr/bin/env bash
set -euo pipefail

CONTROL_PLANE_URL="${CONTROL_PLANE_URL:-http://localhost:8088}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required"
  exit 1
fi

echo "checking control plane health at ${CONTROL_PLANE_URL}/health"
resp="$(curl -fsS "${CONTROL_PLANE_URL}/health")"
echo "${resp}"

echo "checking control plane status at ${CONTROL_PLANE_URL}/status"
status_resp="$(curl -fsS "${CONTROL_PLANE_URL}/status")"
echo "${status_resp}"

echo "health-check: OK"
