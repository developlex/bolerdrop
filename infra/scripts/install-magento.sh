#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <store-id>"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required"
  exit 1
fi

STORE_ID="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STORE_DIR="${ROOT_DIR}/instances/${STORE_ID}"
COMPOSE_FILE="${STORE_DIR}/docker-compose.override.yml"
ENV_FILE="${STORE_DIR}/.env"

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "missing compose file: ${COMPOSE_FILE}"
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "missing runtime env file: ${ENV_FILE}"
  echo "copy ${STORE_DIR}/.env.example to .env and inject runtime values first"
  exit 1
fi

required_env=(
  STORE_ID
  MAGENTO_BASE_URL
  STOREFRONT_BASE_URL
  STOREFRONT_PORT
  MAGENTO_SOURCE_MODE
  MAGENTO_PACKAGE
  MAGENTO_DB_NAME
  MAGENTO_DB_USER
  MAGENTO_DB_PASSWORD
  MYSQL_ROOT_PASSWORD
  MAGENTO_ADMIN_USER
  MAGENTO_ADMIN_PASSWORD
  MAGENTO_ADMIN_EMAIL
  MAGENTO_ADMIN_FIRSTNAME
  MAGENTO_ADMIN_LASTNAME
)

for key in "${required_env[@]}"; do
  value="$(grep -E "^${key}=" "${ENV_FILE}" | head -n1 | cut -d= -f2- || true)"
  if [[ -z "${value}" ]]; then
    echo "missing required key in ${ENV_FILE}: ${key}"
    exit 1
  fi
  if [[ "${value}" == "__SET_AT_RUNTIME__" ]]; then
    echo "placeholder value detected for ${key}; set a real runtime value in ${ENV_FILE}"
    exit 1
  fi
done

source_mode="$(grep -E '^MAGENTO_SOURCE_MODE=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)"
if [[ "${source_mode}" != "composer" && "${source_mode}" != "git" ]]; then
  echo "MAGENTO_SOURCE_MODE must be either 'composer' or 'git'"
  exit 1
fi

if [[ "${source_mode}" == "composer" ]]; then
  for key in MAGENTO_REPO_PUBLIC_KEY MAGENTO_REPO_PRIVATE_KEY; do
    value="$(grep -E "^${key}=" "${ENV_FILE}" | head -n1 | cut -d= -f2- || true)"
    if [[ -z "${value}" || "${value}" == "__SET_AT_RUNTIME__" ]]; then
      echo "composer mode requires non-placeholder ${key}"
      exit 1
    fi
  done
fi

if [[ "${source_mode}" == "git" ]]; then
  for key in MAGENTO_GIT_REPOSITORY MAGENTO_GIT_REF; do
    value="$(grep -E "^${key}=" "${ENV_FILE}" | head -n1 | cut -d= -f2- || true)"
    if [[ -z "${value}" || "${value}" == "__SET_AT_RUNTIME__" ]]; then
      echo "git mode requires non-placeholder ${key}"
      exit 1
    fi
  done
fi

compose_cmd=(docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}")

echo "starting ${STORE_ID} runtime containers"
"${compose_cmd[@]}" up -d --build

echo "waiting for MySQL readiness"
attempts=0
until "${compose_cmd[@]}" exec -T magento-db mysqladmin ping -h 127.0.0.1 -u root -p"$(grep -E '^MYSQL_ROOT_PASSWORD=' "${ENV_FILE}" | cut -d= -f2-)" --silent >/dev/null 2>&1; do
  attempts=$((attempts + 1))
  if (( attempts > 60 )); then
    echo "mysql did not become ready in time"
    exit 1
  fi
  sleep 2
done

echo "waiting for OpenSearch readiness"
attempts=0
until "${compose_cmd[@]}" exec -T magento-search curl -fsS http://127.0.0.1:9200 >/dev/null 2>&1; do
  attempts=$((attempts + 1))
  if (( attempts > 60 )); then
    echo "opensearch did not become ready in time"
    exit 1
  fi
  sleep 2
done

if [[ "${source_mode}" == "composer" ]]; then
  echo "configuring composer auth for repo.magento.com"
  "${compose_cmd[@]}" exec -T magento-app sh -lc '
    set -e
    composer config -g --auth http-basic.repo.magento.com "$MAGENTO_REPO_PUBLIC_KEY" "$MAGENTO_REPO_PRIVATE_KEY"
  '

  echo "installing Magento source via composer (if missing)"
  "${compose_cmd[@]}" exec -T magento-app sh -lc '
    set -e
    if [ ! -f /var/www/html/bin/magento ]; then
      if [ -n "${MAGENTO_VERSION:-}" ]; then
        composer create-project --repository-url=https://repo.magento.com/ "$MAGENTO_PACKAGE" /var/www/html "$MAGENTO_VERSION"
      else
        composer create-project --repository-url=https://repo.magento.com/ "$MAGENTO_PACKAGE" /var/www/html
      fi
    elif [ ! -f /var/www/html/vendor/autoload.php ]; then
      composer install --working-dir=/var/www/html --no-interaction --no-dev --prefer-dist
    fi
  '
else
  echo "installing Magento source via git + composer install (if missing)"
  "${compose_cmd[@]}" exec -T magento-app sh -lc '
    set -e
    if [ ! -f /var/www/html/bin/magento ]; then
      rm -rf /var/www/html/.git /var/www/html/* /var/www/html/.[!.]* /var/www/html/..?* 2>/dev/null || true
      git clone --depth 1 --branch "$MAGENTO_GIT_REF" "$MAGENTO_GIT_REPOSITORY" /var/www/html
    fi
    git config --global --add safe.directory /var/www/html
    if [ ! -f /var/www/html/vendor/autoload.php ]; then
      composer install --working-dir=/var/www/html --no-interaction --no-dev --prefer-dist
    fi
  '
fi

echo "normalizing Magento filesystem ownership"
"${compose_cmd[@]}" exec -T magento-app sh -lc '
  set -e
  chown -R www-data:www-data /var/www/html
  chmod -R u+rwX,g+rwX /var/www/html
'

echo "running Magento setup:install (if app/etc/env.php missing)"
"${compose_cmd[@]}" exec -T --user www-data magento-app sh -lc '
  set -e
  if [ ! -f /var/www/html/app/etc/env.php ]; then
    db_host_value="$MAGENTO_DB_HOST"
    if [ -n "${MAGENTO_DB_PORT:-}" ] && [ "${MAGENTO_DB_PORT}" != "3306" ]; then
      db_host_value="${MAGENTO_DB_HOST}:${MAGENTO_DB_PORT}"
    fi
    php -d memory_limit=2G bin/magento setup:install \
      --base-url="$MAGENTO_BASE_URL" \
      --db-host="$db_host_value" \
      --db-name="$MAGENTO_DB_NAME" \
      --db-user="$MAGENTO_DB_USER" \
      --db-password="$MAGENTO_DB_PASSWORD" \
      --backend-frontname=admin \
      --admin-firstname="$MAGENTO_ADMIN_FIRSTNAME" \
      --admin-lastname="$MAGENTO_ADMIN_LASTNAME" \
      --admin-email="$MAGENTO_ADMIN_EMAIL" \
      --admin-user="$MAGENTO_ADMIN_USER" \
      --admin-password="$MAGENTO_ADMIN_PASSWORD" \
      --language="${MAGENTO_LANGUAGE:-en_US}" \
      --currency="${MAGENTO_CURRENCY:-USD}" \
      --timezone="${MAGENTO_TIMEZONE:-UTC}" \
      --use-rewrites="${MAGENTO_USE_REWRITES:-1}" \
      --search-engine=opensearch \
      --opensearch-host="$MAGENTO_SEARCH_HOST" \
      --opensearch-port="$MAGENTO_SEARCH_PORT" \
      --opensearch-enable-auth=0 \
      --cleanup-database
  fi
'

echo "warming generated code/cache"
"${compose_cmd[@]}" exec -T --user www-data magento-app sh -lc '
  set -e
  rm -rf /var/www/html/generated/code/*
  php -d memory_limit=2G bin/magento setup:upgrade
  php -d memory_limit=2G bin/magento cache:flush
'

echo "installation complete for ${STORE_ID}"
echo "Magento web URL should be available at MAGENTO_BASE_URL"
echo "Decoupled storefront URL should be available at STOREFRONT_BASE_URL"
