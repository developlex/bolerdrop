import type {
  CartSnapshot,
  CatalogProduct,
  CustomerProfile,
  MoneyNode,
  MagentoCartItemNode,
  MagentoCartNode,
  MagentoCustomerNode,
  MagentoProductNode,
  ProductDetail
} from "@/src/lib/commerce/types";

function mapMoney(node: MoneyNode): { value: number | null; currency: string | null } {
  if (!node || typeof node.value !== "number") {
    return { value: null, currency: null };
  }
  return {
    value: node.value,
    currency: typeof node.currency === "string" ? node.currency : null
  };
}

export function mapCatalogProduct(raw: MagentoProductNode): CatalogProduct {
  const money = mapMoney(raw?.price_range?.minimum_price?.final_price ?? raw?.price_range?.minimum_price?.regular_price);
  return {
    id: String(raw?.uid ?? raw?.id ?? raw?.sku ?? ""),
    sku: String(raw?.sku ?? ""),
    name: String(raw?.name ?? ""),
    urlKey: String(raw?.url_key ?? ""),
    imageUrl: raw?.small_image?.url ?? null,
    price: money.value,
    currency: money.currency
  };
}

export function mapProductDetail(raw: MagentoProductNode): ProductDetail {
  const base = mapCatalogProduct(raw);
  return {
    ...base,
    descriptionHtml: typeof raw?.description?.html === "string" ? raw.description.html : null,
    shortDescriptionHtml: typeof raw?.short_description?.html === "string" ? raw.short_description.html : null
  };
}

function mapCartItem(item: MagentoCartItemNode) {
  const rowTotal = mapMoney(item?.prices?.row_total_including_tax ?? item?.prices?.row_total);
  return {
    uid: String(item?.uid ?? ""),
    sku: String(item?.product?.sku ?? ""),
    name: String(item?.product?.name ?? ""),
    quantity: Number(item?.quantity ?? 0),
    lineTotal: rowTotal.value,
    currency: rowTotal.currency
  };
}

export function mapCart(raw: MagentoCartNode): CartSnapshot {
  const totals = mapMoney(raw?.prices?.grand_total);
  const items = Array.isArray(raw?.items)
    ? raw.items.map(mapCartItem)
    : [];

  return {
    id: String(raw?.id ?? ""),
    totalQuantity: Number(raw?.total_quantity ?? 0),
    grandTotal: totals.value,
    currency: totals.currency,
    items
  };
}

export function mapCustomer(raw: MagentoCustomerNode): CustomerProfile {
  return {
    email: String(raw?.email ?? ""),
    firstname: String(raw?.firstname ?? ""),
    lastname: String(raw?.lastname ?? "")
  };
}
