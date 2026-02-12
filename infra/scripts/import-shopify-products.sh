#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
usage: import-shopify-products.sh <store-id> [--limit <count>] [--source-url <url>]

Imports product seed data into a Magento instance by:
1. fetching products from a source JSON feed,
2. creating/updating simple products through Magento REST API,
3. attaching the first product image when possible.

Defaults:
  --limit       10
  --source-url  https://<shop-domain>/collections/<collection-handle>/products.json?limit=250&page=1
EOF
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

STORE_ID="$1"
shift

LIMIT=10
SOURCE_URL="https://<shop-domain>/collections/<collection-handle>/products.json?limit=250&page=1"
SKU_PREFIX="${SKU_PREFIX:-shopify}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --limit)
      LIMIT="${2:-}"
      shift 2
      ;;
    --source-url)
      SOURCE_URL="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if ! [[ "${LIMIT}" =~ ^[0-9]+$ ]] || (( LIMIT <= 0 )); then
  echo "invalid --limit value: ${LIMIT}" >&2
  exit 1
fi

if [[ "${SOURCE_URL}" == *"<"* || "${SOURCE_URL}" == *">"* ]]; then
  echo "invalid --source-url: placeholder detected. Provide a real Shopify products feed URL." >&2
  exit 1
fi

if [[ "${SOURCE_URL}" != http://* && "${SOURCE_URL}" != https://* ]]; then
  echo "invalid --source-url: expected http(s) URL." >&2
  exit 1
fi

INSTANCE_DIR="${ROOT_DIR}/instances/${STORE_ID}"
ENV_FILE="${INSTANCE_DIR}/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "missing runtime env file: ${ENV_FILE}" >&2
  exit 1
fi

require_bin() {
  local name="$1"
  if ! command -v "${name}" >/dev/null 2>&1; then
    echo "required command not found: ${name}" >&2
    exit 1
  fi
}

require_bin curl
require_bin jq
require_bin base64

env_value() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "${ENV_FILE}" | head -n 1 | cut -d'=' -f2- || true)"
  printf '%s' "${value}"
}

require_env_value() {
  local key="$1"
  local value
  value="$(env_value "${key}")"
  if [[ -z "${value}" ]]; then
    echo "required env key missing in ${ENV_FILE}: ${key}" >&2
    exit 1
  fi
  printf '%s' "${value}"
}

MAGENTO_BASE_URL="$(require_env_value "MAGENTO_BASE_URL")"
MAGENTO_ADMIN_USER="$(require_env_value "MAGENTO_ADMIN_USER")"
MAGENTO_ADMIN_PASSWORD="$(require_env_value "MAGENTO_ADMIN_PASSWORD")"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

SOURCE_JSON="${TMP_DIR}/source-products.json"
PRODUCTS_JSONL="${TMP_DIR}/products.jsonl"

echo "fetching source data"
curl -fsSL "${SOURCE_URL}" -o "${SOURCE_JSON}"

jq -c --argjson limit "${LIMIT}" '
  .products[:$limit]
  | map({
      handle: (.handle // ""),
      title: (.title // ""),
      body_html: (.body_html // ""),
      price: ((.variants[0].price // "0") | tostring),
      image_url: (.images[0].src // ""),
      tags: (.tags // ""),
      vendor: (.vendor // "")
    })
  | .[]
' "${SOURCE_JSON}" > "${PRODUCTS_JSONL}"

PRODUCT_COUNT="$(wc -l < "${PRODUCTS_JSONL}" | tr -d ' ')"
if [[ "${PRODUCT_COUNT}" == "0" ]]; then
  echo "source feed returned zero products"
  exit 1
fi

echo "requesting Magento admin token"
ADMIN_TOKEN="$(
  jq -n --arg username "${MAGENTO_ADMIN_USER}" --arg password "${MAGENTO_ADMIN_PASSWORD}" \
    '{username: $username, password: $password}' \
  | curl -fsSL -X POST "${MAGENTO_BASE_URL}/rest/V1/integration/admin/token" \
      -H "Content-Type: application/json" \
      --data @- \
  | jq -r '.'
)"

if [[ -z "${ADMIN_TOKEN}" || "${ADMIN_TOKEN}" == "null" ]]; then
  echo "failed to obtain Magento admin token" >&2
  exit 1
fi

mime_from_url() {
  local url="$1"
  local lower
  lower="$(printf '%s' "${url}" | tr '[:upper:]' '[:lower:]')"
  if [[ "${lower}" == *.png* ]]; then
    printf '%s' "image/png"
    return
  fi
  if [[ "${lower}" == *.webp* ]]; then
    printf '%s' "image/webp"
    return
  fi
  printf '%s' "image/jpeg"
}

sanitize_sku() {
  local raw="$1"
  local safe
  safe="$(printf '%s' "${raw}" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9-' '-' | sed 's/^-*//;s/-*$//')"
  if [[ -z "${safe}" ]]; then
    safe="product"
  fi
  printf '%s' "${SKU_PREFIX}-${safe}" | cut -c1-64
}

create_or_update_product() {
  local payload="$1"
  local sku="$2"
  curl -fsSL -X PUT "${MAGENTO_BASE_URL}/rest/V1/products/${sku}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "${payload}" >/dev/null
}

get_existing_media_count() {
  local sku="$1"
  curl -fsSL "${MAGENTO_BASE_URL}/rest/V1/products/${sku}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    | jq -r '.media_gallery_entries | if type == "array" then length else 0 end'
}

attach_image_if_missing() {
  local sku="$1"
  local product_name="$2"
  local image_url="$3"

  if [[ -z "${image_url}" ]]; then
    echo "  no image URL in source feed, skipping media upload"
    return
  fi

  local existing_media
  existing_media="$(get_existing_media_count "${sku}")"
  if [[ "${existing_media}" != "0" ]]; then
    echo "  media already present, skipping upload"
    return
  fi

  local image_file="${TMP_DIR}/${sku}.img"
  local download_url="${image_url}"
  if [[ "${image_url}" == *"cdn.shopify.com"* ]]; then
    if [[ "${image_url}" == *"?"* ]]; then
      download_url="${image_url}&width=1200"
    else
      download_url="${image_url}?width=1200"
    fi
  fi

  if ! curl -fsSL "${download_url}" -o "${image_file}"; then
    echo "  failed to download image, skipping media upload"
    return
  fi

  local encoded_file="${TMP_DIR}/${sku}.b64"
  base64 < "${image_file}" | tr -d '\n' > "${encoded_file}"
  local mime
  mime="$(mime_from_url "${image_url}")"
  local image_name
  image_name="$(basename "${image_url%%\?*}")"
  if [[ -z "${image_name}" || "${image_name}" == "/" ]]; then
    image_name="${sku}.jpg"
  fi

  local payload_file="${TMP_DIR}/${sku}-media.json"
  jq -n \
    --arg label "${product_name}" \
    --arg image_name "${image_name}" \
    --arg mime "${mime}" \
    --rawfile encoded "${encoded_file}" \
    '{
      entry: {
        media_type: "image",
        label: $label,
        position: 1,
        disabled: false,
        types: ["image", "small_image", "thumbnail"],
        content: {
          base64_encoded_data: $encoded,
          type: $mime,
          name: $image_name
        }
      }
    }' > "${payload_file}"

  if ! curl -fsSL -X POST "${MAGENTO_BASE_URL}/rest/V1/products/${sku}/media" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" \
      --data @"${payload_file}" >/dev/null; then
    echo "  media upload failed, continuing"
  fi
}

echo "importing ${PRODUCT_COUNT} products into ${STORE_ID}"
line_number=0
while IFS= read -r row; do
  line_number=$((line_number + 1))
  title="$(jq -r '.title' <<<"${row}")"
  handle="$(jq -r '.handle' <<<"${row}")"
  body_html="$(jq -r '.body_html' <<<"${row}")"
  price_raw="$(jq -r '.price' <<<"${row}")"
  image_url="$(jq -r '.image_url' <<<"${row}")"
  tags="$(jq -r '.tags' <<<"${row}")"
  vendor="$(jq -r '.vendor' <<<"${row}")"

  if [[ -z "${title}" || "${title}" == "null" ]]; then
    echo "[${line_number}] source product has empty title, skipping"
    continue
  fi

  sku="$(sanitize_sku "${handle}")"
  price="$(jq -n --arg p "${price_raw}" '$p | tonumber? // 0')"
  if [[ "${price}" == "0" ]]; then
    price="19.99"
  fi

  short_text="$(
    jq -n --arg html "${body_html}" '
      $html
      | gsub("<[^>]+>"; " ")
      | gsub("&nbsp;"; " ")
      | gsub("&amp;"; "&")
      | gsub("\\s+"; " ")
      | sub("^\\s+"; "")
      | sub("\\s+$"; "")
      | .[0:240]
    '
  )"

  meta_description="${short_text}"
  if [[ -n "${vendor}" && "${vendor}" != "null" ]]; then
    meta_description="${meta_description} · ${vendor}"
  fi

  description_html="${body_html}"
  if [[ -n "${tags}" && "${tags}" != "null" ]]; then
    description_html="${description_html}<p><strong>Source tags:</strong> ${tags}</p>"
  fi

  payload="$(
    jq -n \
      --arg sku "${sku}" \
      --arg name "${title}" \
      --argjson price "${price}" \
      --arg description "${description_html}" \
      --arg short_description "${short_text}" \
      --arg url_key "${handle}" \
      --arg meta_title "${title}" \
      --arg meta_description "${meta_description}" \
      '{
        product: {
          sku: $sku,
          name: $name,
          attribute_set_id: 4,
          status: 1,
          visibility: 4,
          type_id: "simple",
          price: $price,
          weight: 1,
          extension_attributes: {
            stock_item: {
              qty: 100,
              is_in_stock: true
            }
          },
          custom_attributes: [
            { attribute_code: "description", value: $description },
            { attribute_code: "short_description", value: $short_description },
            { attribute_code: "url_key", value: $url_key },
            { attribute_code: "meta_title", value: $meta_title },
            { attribute_code: "meta_description", value: $meta_description }
          ]
        },
        saveOptions: true
      }'
  )"

  echo "[${line_number}/${PRODUCT_COUNT}] upserting ${sku}"
  create_or_update_product "${payload}" "${sku}"
  attach_image_if_missing "${sku}" "${title}" "${image_url}"
done < "${PRODUCTS_JSONL}"

echo "triggering reindex + cache flush inside container"
docker compose --env-file "${ENV_FILE}" \
  -f "${INSTANCE_DIR}/docker-compose.override.yml" \
  exec -T --user www-data magento-app sh -lc '
    set -e
    cd /var/www/html
    php -d memory_limit=2G bin/magento indexer:reindex
    php -d memory_limit=2G bin/magento cache:flush
  ' >/dev/null

echo "seed import complete"
echo "verify catalog at ${MAGENTO_BASE_URL} and storefront listing page"
