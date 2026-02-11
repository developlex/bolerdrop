#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
usage: new-shop.sh <store-id> [--magento-port <port>] [--shop-agent-port <port>]

Creates instances/<store-id>/ with:
- docker-compose.override.yml (full runtime template)
- .env.example (non-secret placeholder template)

If ports are omitted, they are allocated automatically from available local ports.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

STORE_ID="$1"
shift

MAGENTO_PORT=""
SHOP_AGENT_PORT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --magento-port)
      MAGENTO_PORT="$2"
      shift 2
      ;;
    --shop-agent-port)
      SHOP_AGENT_PORT="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STORE_DIR="${ROOT_DIR}/instances/${STORE_ID}"
TEMPLATE_COMPOSE="${ROOT_DIR}/infra/docker/instance/docker-compose.override.yml"
TEMPLATE_ENV="${ROOT_DIR}/infra/docker/instance/env.example"

if [[ -d "${STORE_DIR}" ]]; then
  echo "store already exists: ${STORE_DIR}"
  exit 1
fi

if [[ ! -f "${TEMPLATE_COMPOSE}" ]]; then
  echo "missing compose template: ${TEMPLATE_COMPOSE}"
  exit 1
fi

if [[ ! -f "${TEMPLATE_ENV}" ]]; then
  echo "missing env template: ${TEMPLATE_ENV}"
  exit 1
fi

is_port_bound() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
    return 0
  fi
  if command -v nc >/dev/null 2>&1 && nc -z 127.0.0.1 "${port}" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

RESERVED_PORTS=" "
reserve_port() {
  RESERVED_PORTS="${RESERVED_PORTS}$1 "
}

is_reserved_port() {
  [[ " ${RESERVED_PORTS} " == *" $1 "* ]]
}

load_reserved_ports_from_envs() {
  local env_file
  shopt -s nullglob
  for env_file in "${ROOT_DIR}"/instances/*/.env "${ROOT_DIR}"/instances/*/.env.example; do
    while IFS='=' read -r key value; do
      case "${key}" in
        MAGENTO_HTTP_PORT|SHOP_AGENT_PORT)
          if [[ "${value}" =~ ^[0-9]+$ ]]; then
            reserve_port "${value}"
          fi
          ;;
      esac
    done < "${env_file}"
  done
  shopt -u nullglob
}

next_available_port() {
  local candidate="$1"
  while true; do
    if ! is_reserved_port "${candidate}" && ! is_port_bound "${candidate}"; then
      echo "${candidate}"
      return 0
    fi
    candidate=$((candidate + 1))
  done
}

load_reserved_ports_from_envs

if [[ -z "${MAGENTO_PORT}" ]]; then
  MAGENTO_PORT="$(next_available_port 8181)"
fi
reserve_port "${MAGENTO_PORT}"

if [[ -z "${SHOP_AGENT_PORT}" ]]; then
  SHOP_AGENT_PORT="$(next_available_port 8191)"
fi
reserve_port "${SHOP_AGENT_PORT}"

mkdir -p "${STORE_DIR}"
cp "${TEMPLATE_COMPOSE}" "${STORE_DIR}/docker-compose.override.yml"

sed \
  -e "s/^STORE_ID=.*/STORE_ID=${STORE_ID}/" \
  -e "s#^MAGENTO_BASE_URL=.*#MAGENTO_BASE_URL=http://localhost:${MAGENTO_PORT}#" \
  -e "s/^MAGENTO_HTTP_PORT=.*/MAGENTO_HTTP_PORT=${MAGENTO_PORT}/" \
  -e "s/^SHOP_AGENT_PORT=.*/SHOP_AGENT_PORT=${SHOP_AGENT_PORT}/" \
  "${TEMPLATE_ENV}" > "${STORE_DIR}/.env.example"

echo "created ${STORE_DIR}"
echo "allocated ports: MAGENTO=${MAGENTO_PORT}, SHOP_AGENT=${SHOP_AGENT_PORT}"
echo "next: copy .env.example to .env and inject runtime values, or run bootstrap-platform.sh"
