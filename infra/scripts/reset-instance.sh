#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <store-id>"
  exit 1
fi

STORE_ID="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STORE_DIR="${ROOT_DIR}/instances/${STORE_ID}"

if [[ ! -d "${STORE_DIR}" ]]; then
  echo "store does not exist: ${STORE_ID}"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found; cannot stop runtime"
else
  docker compose -f "${ROOT_DIR}/control-plane/docker-compose.yml" down --remove-orphans || true
fi

rm -f "${STORE_DIR}/.env"
echo "reset complete for ${STORE_ID} (runtime env removed)"
