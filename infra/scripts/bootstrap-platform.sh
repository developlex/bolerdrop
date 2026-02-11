#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
usage: bootstrap-platform.sh [options]

Options:
  --count <n>              Number of store instances to bootstrap (default: 1)
  --start-index <n>        Starting numeric suffix for store IDs (default: 1)
  --store-prefix <prefix>  Store ID prefix (default: shop)
  --no-control-plane       Do not start Control Plane
  --no-install             Create/ensure runtime and start containers only (skip Magento install)
  --provision-only         Only create instance directories and env files, do not start containers
  -h, --help               Show help

Examples:
  bash infra/scripts/bootstrap-platform.sh --count 2
  bash infra/scripts/bootstrap-platform.sh --count 3 --start-index 10 --no-install
  bash infra/scripts/bootstrap-platform.sh --count 2 --provision-only
USAGE
}

COUNT=1
START_INDEX=1
STORE_PREFIX="shop"
START_CONTROL_PLANE=1
RUN_INSTALL=1
PROVISION_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --count)
      COUNT="$2"
      shift 2
      ;;
    --start-index)
      START_INDEX="$2"
      shift 2
      ;;
    --store-prefix)
      STORE_PREFIX="$2"
      shift 2
      ;;
    --no-control-plane)
      START_CONTROL_PLANE=0
      shift
      ;;
    --no-install)
      RUN_INSTALL=0
      shift
      ;;
    --provision-only)
      PROVISION_ONLY=1
      RUN_INSTALL=0
      START_CONTROL_PLANE=0
      shift
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

if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || (( COUNT < 1 )); then
  echo "--count must be a positive integer"
  exit 1
fi

if ! [[ "$START_INDEX" =~ ^[0-9]+$ ]] || (( START_INDEX < 1 )); then
  echo "--start-index must be a positive integer"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INSTANCE_TEMPLATE_COMPOSE="${ROOT_DIR}/infra/docker/instance/docker-compose.override.yml"
INSTANCE_TEMPLATE_ENV="${ROOT_DIR}/infra/docker/instance/env.example"
INSTALL_SCRIPT="${ROOT_DIR}/infra/scripts/install-magento.sh"

if [[ ! -f "${INSTANCE_TEMPLATE_COMPOSE}" ]]; then
  echo "missing compose template: ${INSTANCE_TEMPLATE_COMPOSE}"
  exit 1
fi

if [[ ! -f "${INSTANCE_TEMPLATE_ENV}" ]]; then
  echo "missing env template: ${INSTANCE_TEMPLATE_ENV}"
  exit 1
fi

if [[ ! -x "${INSTALL_SCRIPT}" ]]; then
  echo "missing executable install script: ${INSTALL_SCRIPT}"
  exit 1
fi

if (( PROVISION_ONLY == 0 )) && ! command -v docker >/dev/null 2>&1; then
  echo "docker is required"
  exit 1
fi

rand_hex() {
  local bytes="$1"
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "${bytes}"
  else
    od -An -N "${bytes}" -tx1 /dev/urandom | tr -d ' \n'
  fi
}

is_port_bound() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    if lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
  fi
  if command -v nc >/dev/null 2>&1; then
    if nc -z 127.0.0.1 "${port}" >/dev/null 2>&1; then
      return 0
    fi
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

collect_used_ports_from_existing_envs() {
  local env_file
  shopt -s nullglob
  for env_file in "${ROOT_DIR}"/instances/*/.env "${ROOT_DIR}"/instances/*/.env.example; do
    while IFS='=' read -r key value; do
      case "${key}" in
        MAGENTO_HTTP_PORT|SHOP_AGENT_PORT|STOREFRONT_PORT)
          if [[ "${value}" =~ ^[0-9]+$ ]]; then
            reserve_port "${value}"
          fi
          ;;
      esac
    done < "${env_file}"
  done
  shopt -u nullglob
}

read_port_from_file() {
  local file_path="$1"
  local key="$2"
  if [[ ! -f "${file_path}" ]]; then
    return 0
  fi
  grep -E "^${key}=" "${file_path}" | head -n1 | cut -d= -f2- || true
}

write_env_example() {
  local store_id="$1"
  local magento_port="$2"
  local shop_agent_port="$3"
  local storefront_port="$4"
  local example_file="$5"

  sed \
    -e "s/^STORE_ID=.*/STORE_ID=${store_id}/" \
    -e "s#^MAGENTO_BASE_URL=.*#MAGENTO_BASE_URL=http://localhost:${magento_port}#" \
    -e "s/^MAGENTO_HTTP_PORT=.*/MAGENTO_HTTP_PORT=${magento_port}/" \
    -e "s/^SHOP_AGENT_PORT=.*/SHOP_AGENT_PORT=${shop_agent_port}/" \
    -e "s#^STOREFRONT_BASE_URL=.*#STOREFRONT_BASE_URL=http://localhost:${storefront_port}#" \
    -e "s/^STOREFRONT_PORT=.*/STOREFRONT_PORT=${storefront_port}/" \
    "${INSTANCE_TEMPLATE_ENV}" > "${example_file}"
}

write_runtime_env() {
  local store_id="$1"
  local magento_port="$2"
  local shop_agent_port="$3"
  local storefront_port="$4"
  local env_file="$5"

  local db_password="db_$(rand_hex 12)"
  local db_root_password="root_$(rand_hex 12)"
  local jwt_secret="jwt_$(rand_hex 24)"
  local admin_user="admin_${store_id//-/_}"
  local admin_password="Aa1!$(rand_hex 12)"

  cat > "${env_file}" <<ENV
# Auto-generated local runtime file. Do not commit.
STORE_ID=${store_id}
SHOP_AGENT_VERSION=0.1.0
DEPLOYMENT_VERSION=local

MAGENTO_BASE_URL=http://localhost:${magento_port}
MAGENTO_HTTP_PORT=${magento_port}
SHOP_AGENT_PORT=${shop_agent_port}
STOREFRONT_BASE_URL=http://localhost:${storefront_port}
STOREFRONT_PORT=${storefront_port}
STOREFRONT_ENABLED=1

MAGENTO_SOURCE_MODE=git
MAGENTO_PACKAGE=magento/project-community-edition
MAGENTO_VERSION=
MAGENTO_REPO_PUBLIC_KEY=__SET_AT_RUNTIME__
MAGENTO_REPO_PRIVATE_KEY=__SET_AT_RUNTIME__
MAGENTO_GIT_REPOSITORY=https://github.com/magento/magento2.git
MAGENTO_GIT_REF=2.4-develop

MAGENTO_DB_NAME=magento
MAGENTO_DB_USER=magento
MAGENTO_DB_PASSWORD=${db_password}
MYSQL_ROOT_PASSWORD=${db_root_password}

MAGENTO_ADMIN_USER=${admin_user}
MAGENTO_ADMIN_PASSWORD=${admin_password}
MAGENTO_ADMIN_EMAIL=${store_id}@local.example
MAGENTO_ADMIN_FIRSTNAME=Store
MAGENTO_ADMIN_LASTNAME=Admin
MAGENTO_LANGUAGE=en_US
MAGENTO_CURRENCY=USD
MAGENTO_TIMEZONE=UTC
MAGENTO_USE_REWRITES=1

AGENT_JWT_SECRET=${jwt_secret}
AGENT_JWT_ISSUER=${store_id}-issuer
AGENT_JWT_AUDIENCE=${store_id}-audience
AGENT_JWT_LEEWAY_SECONDS=5
AGENT_JWT_MAX_TTL_SECONDS=900
ENV
}

read_storefront_enabled() {
  local env_file="$1"
  local value
  value="$(read_port_from_file "${env_file}" "STOREFRONT_ENABLED")"
  if [[ -z "${value}" ]]; then
    value="1"
  fi
  if [[ "${value}" != "0" && "${value}" != "1" ]]; then
    echo "invalid STOREFRONT_ENABLED in ${env_file}; expected 0 or 1"
    exit 1
  fi
  echo "${value}"
}

start_runtime_slice() {
  local env_file="$1"
  local compose_file="$2"
  local storefront_enabled
  storefront_enabled="$(read_storefront_enabled "${env_file}")"

  local compose_cmd=(docker compose --env-file "${env_file}" -f "${compose_file}")
  local services=(magento-db magento-search magento-cache magento-app magento-web magento-cron shop-agent)

  if [[ "${storefront_enabled}" == "1" ]]; then
    services+=(storefront)
  fi

  "${compose_cmd[@]}" up -d --build "${services[@]}"

  if [[ "${storefront_enabled}" == "0" ]]; then
    "${compose_cmd[@]}" rm -sf storefront >/dev/null 2>&1 || true
  fi
}

collect_used_ports_from_existing_envs

if (( START_CONTROL_PLANE == 1 )); then
  echo "starting Control Plane runtime"
  docker compose -f "${ROOT_DIR}/control-plane/docker-compose.yml" up -d --build
fi

magento_port_cursor=8181
agent_port_cursor=8191
storefront_port_cursor=8281

for (( offset=0; offset<COUNT; offset++ )); do
  index=$((START_INDEX + offset))
  store_id="$(printf '%s-%03d' "${STORE_PREFIX}" "${index}")"
  store_dir="${ROOT_DIR}/instances/${store_id}"
  compose_file="${store_dir}/docker-compose.override.yml"
  env_file="${store_dir}/.env"
  env_example_file="${store_dir}/.env.example"

  mkdir -p "${store_dir}"

  if [[ ! -f "${compose_file}" ]] || [[ ! -s "${compose_file}" ]]; then
    cp "${INSTANCE_TEMPLATE_COMPOSE}" "${compose_file}"
  fi

  magento_port="$(read_port_from_file "${env_file}" "MAGENTO_HTTP_PORT")"
  if [[ -z "${magento_port}" ]]; then
    magento_port="$(read_port_from_file "${env_example_file}" "MAGENTO_HTTP_PORT")"
  fi
  if [[ ! "${magento_port}" =~ ^[0-9]+$ ]]; then
    magento_port="$(next_available_port "${magento_port_cursor}")"
  fi
  reserve_port "${magento_port}"
  if (( magento_port >= magento_port_cursor )); then
    magento_port_cursor=$((magento_port + 1))
  fi

  agent_port="$(read_port_from_file "${env_file}" "SHOP_AGENT_PORT")"
  if [[ -z "${agent_port}" ]]; then
    agent_port="$(read_port_from_file "${env_example_file}" "SHOP_AGENT_PORT")"
  fi
  if [[ ! "${agent_port}" =~ ^[0-9]+$ ]]; then
    agent_port="$(next_available_port "${agent_port_cursor}")"
  fi
  reserve_port "${agent_port}"
  if (( agent_port >= agent_port_cursor )); then
    agent_port_cursor=$((agent_port + 1))
  fi

  storefront_port="$(read_port_from_file "${env_file}" "STOREFRONT_PORT")"
  if [[ -z "${storefront_port}" ]]; then
    storefront_port="$(read_port_from_file "${env_example_file}" "STOREFRONT_PORT")"
  fi
  if [[ ! "${storefront_port}" =~ ^[0-9]+$ ]]; then
    storefront_port="$(next_available_port "${storefront_port_cursor}")"
  fi
  reserve_port "${storefront_port}"
  if (( storefront_port >= storefront_port_cursor )); then
    storefront_port_cursor=$((storefront_port + 1))
  fi

  write_env_example "${store_id}" "${magento_port}" "${agent_port}" "${storefront_port}" "${env_example_file}"

  if [[ ! -f "${env_file}" ]]; then
    write_runtime_env "${store_id}" "${magento_port}" "${agent_port}" "${storefront_port}" "${env_file}"
  else
    current_store_id="$(grep -E '^STORE_ID=' "${env_file}" | head -n1 | cut -d= -f2- || true)"
    if [[ "${current_store_id}" != "${store_id}" ]]; then
      echo "existing ${env_file} has STORE_ID=${current_store_id}, expected ${store_id}"
      exit 1
    fi
    if ! grep -Eq '^STOREFRONT_PORT=' "${env_file}"; then
      printf '\nSTOREFRONT_PORT=%s\n' "${storefront_port}" >> "${env_file}"
    fi
    if ! grep -Eq '^STOREFRONT_BASE_URL=' "${env_file}"; then
      printf 'STOREFRONT_BASE_URL=http://localhost:%s\n' "${storefront_port}" >> "${env_file}"
    fi
    if ! grep -Eq '^STOREFRONT_ENABLED=' "${env_file}"; then
      printf 'STOREFRONT_ENABLED=1\n' >> "${env_file}"
    fi
  fi

  if (( PROVISION_ONLY == 1 )); then
    echo "provisioned ${store_id} (MAGENTO=${magento_port}, SHOP_AGENT=${agent_port}, STOREFRONT=${storefront_port})"
    continue
  fi

  if (( RUN_INSTALL == 1 )); then
    echo "bootstrap + install ${store_id}"
    bash "${INSTALL_SCRIPT}" "${store_id}"
  else
    echo "start runtime only ${store_id}"
    start_runtime_slice "${env_file}" "${compose_file}"
  fi

done

if (( PROVISION_ONLY == 1 )); then
  echo "provision-only complete"
  exit 0
fi

echo "platform bootstrap complete"
