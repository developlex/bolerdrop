#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <store-id>"
  exit 1
fi

STORE_ID="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STORE_DIR="${ROOT_DIR}/instances/${STORE_ID}"

if [[ -d "${STORE_DIR}" ]]; then
  echo "store already exists: ${STORE_DIR}"
  exit 1
fi

mkdir -p "${STORE_DIR}"

cat > "${STORE_DIR}/.env.example" <<EOF
# Non-secret template for ${STORE_ID} runtime config
STORE_ID=${STORE_ID}
MAGENTO_BASE_URL=http://localhost:8180
SHOP_AGENT_URL=http://localhost:8190
EOF

cp "${ROOT_DIR}/infra/docker/instance/docker-compose.override.yml" \
  "${STORE_DIR}/docker-compose.override.yml"

echo "created ${STORE_DIR}"
echo "next: customize ${STORE_DIR}/.env.example and runtime ports"
